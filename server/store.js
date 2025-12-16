/**
 * In-memory data store for the polling system (ROOM-BASED ARCHITECTURE)
 * Supports multiple teachers with isolated rooms
 * Each room maintains its own state
 */

const store = {
  // Room-based architecture: { roomId: RoomState }
  rooms: {},
  
  // Teacher session timers: { roomId: timeoutId }
  teacherSessionTimers: {},
  
  // Teacher session TTL (5 minutes)
  TEACHER_SESSION_TTL: 5 * 60 * 1000
};

/**
 * Room State Structure:
 * {
 *   roomId: string,
 *   teacherSocketId: string,
 *   teacherName: string,
 *   students: { socketId: { name, hasAnswered, socketRef } },
 *   currentPoll: {
 *     question, options, answers,
 *     startTime, duration, isActive,
 *     activeStudents: [socketId], // SNAPSHOT at poll start
 *     completionReason: null | "TIME_EXPIRED" | "ALL_ANSWERED"
 *   },
 *   pastPolls: []
 * }
 */

/**
 * Create a new room for a teacher
 */
function createRoom(roomId, teacherSocketId, teacherName = 'Teacher') {
  if (store.rooms[roomId]) {
    return { success: false, error: 'Room already exists' };
  }

  store.rooms[roomId] = {
    roomId,
    teacherSocketId,
    teacherName,
    students: {},
    currentPoll: null,
    pastPolls: []
  };

  // Clear any existing session timer
  if (store.teacherSessionTimers[roomId]) {
    clearTimeout(store.teacherSessionTimers[roomId]);
    delete store.teacherSessionTimers[roomId];
  }

  return { success: true, room: store.rooms[roomId] };
}

/**
 * Get room by ID
 */
function getRoom(roomId) {
  return store.rooms[roomId] || null;
}

/**
 * Add a new student to a specific room
 */
function addStudent(roomId, socketId, name, socketRef) {
  const room = getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  room.students[socketId] = {
    name,
    hasAnswered: false,
    socketRef
  };

  return { success: true };
}

/**
 * Remove a student from a specific room
 * If student was in activeStudents snapshot, remove them
 */
function removeStudent(roomId, socketId) {
  const room = getRoom(roomId);
  if (!room) return { success: false };

  delete room.students[socketId];

  // CRITICAL: Remove from active students snapshot if poll is active
  if (room.currentPoll && room.currentPoll.activeStudents) {
    const index = room.currentPoll.activeStudents.indexOf(socketId);
    if (index > -1) {
      room.currentPoll.activeStudents.splice(index, 1);
    }
  }

  return { success: true };
}

/**
 * Get all students in a room as an array
 */
function getAllStudents(roomId) {
  const room = getRoom(roomId);
  if (!room) return [];

  return Object.entries(room.students).map(([socketId, data]) => ({
    socketId,
    name: data.name,
    hasAnswered: data.hasAnswered
  }));
}

/**
 * Create a new poll in a specific room
 * CRITICAL FIX: Capture SNAPSHOT of active students at poll start
 * UPDATED: Now supports correct answer tracking
 */
function createPoll(roomId, question, options, duration, correctOptionIndex) {
  const room = getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Validate correct option index
  console.log('createPoll - validating correctOptionIndex:', correctOptionIndex, 'options.length:', options.length);
  if (correctOptionIndex === undefined || correctOptionIndex === null) {
    console.log('ERROR: correctOptionIndex is undefined or null!');
    return { success: false, error: 'Correct option must be specified' };
  }

  if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    console.log('ERROR: correctOptionIndex out of bounds!');
    return { success: false, error: 'Invalid correct option index' };
  }
  console.log('correctOptionIndex is valid:', correctOptionIndex);

  // NOTE: Don't save currentPoll to history here
  // It will be saved in endPoll() when it actually completes with all data

  // CRITICAL: Take SNAPSHOT of currently connected students
  const activeStudents = Object.keys(room.students);

  // Reset all students' hasAnswered status
  activeStudents.forEach(socketId => {
    if (room.students[socketId]) {
      room.students[socketId].hasAnswered = false;
    }
  });

  // Create new poll with activeStudents snapshot and correct answer
  room.currentPoll = {
    question,
    options,
    correctOptionIndex, // NEW: Store correct answer
    answers: {}, // { socketId: optionIndex }
    startTime: Date.now(),
    duration: duration * 1000, // Convert to milliseconds
    isActive: true,
    activeStudents: activeStudents, // SNAPSHOT - only these students count
    completionReason: null
  };

  return { success: true, poll: room.currentPoll };
}

/**
 * Submit an answer to the current poll in a room
 */
function submitAnswer(roomId, socketId, optionIndex) {
  const room = getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  if (!room.currentPoll) {
    return { success: false, error: 'No active poll' };
  }

  if (!room.students[socketId]) {
    return { success: false, error: 'Student not in room' };
  }

  if (room.students[socketId].hasAnswered) {
    return { success: false, error: 'Already answered' };
  }

  // Check if poll time has expired
  const elapsed = Date.now() - room.currentPoll.startTime;
  if (elapsed > room.currentPoll.duration) {
    return { success: false, error: 'Poll time expired' };
  }

  // Record answer
  room.currentPoll.answers[socketId] = optionIndex;
  room.students[socketId].hasAnswered = true;

  return { success: true };
}

/**
 * Get poll results with vote counts for a room
 * UPDATED: Includes correct answer information
 */
function getPollResults(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.currentPoll) {
    return null;
  }

  const results = room.currentPoll.options.map(() => 0);
  
  Object.values(room.currentPoll.answers).forEach(optionIndex => {
    results[optionIndex]++;
  });

  return {
    question: room.currentPoll.question,
    options: room.currentPoll.options,
    correctOptionIndex: room.currentPoll.correctOptionIndex, // NEW: Include correct answer
    results,
    totalVotes: Object.keys(room.currentPoll.answers).length,
    totalStudents: Object.keys(room.students).length,
    activeStudents: room.currentPoll.activeStudents.length,
    startTime: room.currentPoll.startTime,
    duration: room.currentPoll.duration,
    completionReason: room.currentPoll.completionReason
  };
}

/**
 * CRITICAL FIX: Check if all ACTIVE students (from snapshot) have answered
 * New students joining mid-poll do NOT block completion
 */
function allActiveStudentsAnswered(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.currentPoll) return false;

  const { activeStudents } = room.currentPoll;
  
  // If no active students at poll start, return true (edge case)
  if (!activeStudents || activeStudents.length === 0) return true;

  // Check if ALL students in the snapshot have answered
  return activeStudents.every(socketId => {
    // If student disconnected, they don't block (already removed from snapshot)
    if (!room.students[socketId]) return true;
    return room.students[socketId].hasAnswered;
  });
}

/**
 * End the current poll with a reason
 * @param {string} reason - "TIME_EXPIRED" | "ALL_ANSWERED"
 * Saves poll to history when ending
 */
function endPoll(roomId, reason) {
  const room = getRoom(roomId);
  if (!room || !room.currentPoll) return { success: false };

  room.currentPoll.isActive = false;
  room.currentPoll.completionReason = reason;
  room.currentPoll.endTime = Date.now();

  // Save to poll history with complete data
  room.pastPolls.push({ ...room.currentPoll });
  
  console.log(`Poll saved to history for room ${roomId}:`, room.currentPoll.question);

  return { success: true, reason };
}

/**
 * CRITICAL FIX: Check if a new poll can be created
 * Poll is complete if: no active poll OR poll ended (by timer or all answered)
 */
function canCreateNewPoll(roomId) {
  const room = getRoom(roomId);
  if (!room) return false;

  // Can create if no poll exists
  if (!room.currentPoll) return true;
  
  // Can create if current poll is not active (already ended)
  if (!room.currentPoll.isActive) return true;

  // Cannot create if poll is still active
  return false;
}

/**
 * Start teacher session timeout
 * If teacher doesn't reconnect within TTL, reset the room
 */
function startTeacherSessionTimeout(roomId, onExpire) {
  // Clear any existing timer
  if (store.teacherSessionTimers[roomId]) {
    clearTimeout(store.teacherSessionTimers[roomId]);
  }

  // Start new timer
  store.teacherSessionTimers[roomId] = setTimeout(() => {
    console.log(`Teacher session expired for room: ${roomId}`);
    resetSession(roomId);
    if (onExpire) onExpire(roomId);
  }, store.TEACHER_SESSION_TTL);

  console.log(`Teacher session timeout started for room: ${roomId} (${store.TEACHER_SESSION_TTL / 1000}s)`);
}

/**
 * Cancel teacher session timeout (when teacher reconnects)
 */
function cancelTeacherSessionTimeout(roomId) {
  if (store.teacherSessionTimers[roomId]) {
    clearTimeout(store.teacherSessionTimers[roomId]);
    delete store.teacherSessionTimers[roomId];
    console.log(`Teacher session timeout cancelled for room: ${roomId}`);
  }
}

/**
 * Reset a room's session (called when teacher session expires)
 */
function resetSession(roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  // Disconnect all students
  Object.values(room.students).forEach(student => {
    if (student.socketRef) {
      student.socketRef.disconnect(true);
    }
  });

  // Clear room data
  delete store.rooms[roomId];
  delete store.teacherSessionTimers[roomId];

  console.log(`Session reset for room: ${roomId}`);
}

/**
 * Update teacher socket ID (for reconnection)
 */
function updateTeacherSocket(roomId, newSocketId) {
  const room = getRoom(roomId);
  if (!room) return { success: false };

  room.teacherSocketId = newSocketId;
  return { success: true };
}

/**
 * Get poll history for a room
 * Returns formatted past polls with results
 * UPDATED: Includes correct answer information
 */
function getPollHistory(roomId) {
  const room = getRoom(roomId);
  if (!room) return [];

  // Format past polls with calculated results
  return room.pastPolls.map((poll, index) => {
    const results = poll.options.map(() => 0);
    const totalVotes = Object.keys(poll.answers || {}).length;

    // Calculate vote counts
    Object.values(poll.answers || {}).forEach(optionIndex => {
      if (results[optionIndex] !== undefined) {
        results[optionIndex]++;
      }
    });

    // Calculate percentages
    const percentages = results.map(count => 
      totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
    );

    return {
      id: index + 1,
      question: poll.question,
      options: poll.options,
      correctOptionIndex: poll.correctOptionIndex, // NEW: Include correct answer
      results,
      percentages,
      totalVotes,
      startTime: poll.startTime,
      endTime: poll.endTime,
      completionReason: poll.completionReason
    };
  });
}

module.exports = {
  store,
  createRoom,
  getRoom,
  addStudent,
  removeStudent,
  getAllStudents,
  createPoll,
  submitAnswer,
  getPollResults,
  allActiveStudentsAnswered,
  endPoll,
  canCreateNewPoll,
  startTeacherSessionTimeout,
  cancelTeacherSessionTimeout,
  resetSession,
  updateTeacherSocket,
  getPollHistory
};
