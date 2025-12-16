/**
 * In-memory data store for the polling system (ROOM-BASED ARCHITECTURE)
 * Supports multiple teachers with isolated rooms
 * Each room maintains its own state
 * 
 * SECURITY: All room data is strictly isolated - no cross-room data leakage
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
 * Room State Structure (aligned with specification):
 * {
 *   roomId: string,
 *   teacher: { socketId: string, name: string },
 *   students: Map<socketId, { name, hasAnswered }>,
 *   activePoll: {
 *     question: string,
 *     options: string[],
 *     correctOptionIndex: number,
 *     answers: Map<socketId, optionIndex>,
 *     timerEndsAt: timestamp,
 *     startTime: timestamp,
 *     duration: number,
 *     isActive: boolean,
 *     activeStudents: socketId[], // SNAPSHOT at poll start
 *     completionReason: null | "TIME_EXPIRED" | "ALL_ANSWERED"
 *   },
 *   pollHistory: [],
 *   chat: []
 * }
 */

/**
 * Create a new room for a teacher
 * SECURITY: Enforces one teacher per room
 */
function createRoom(roomId, teacherSocketId, teacherName = 'Teacher') {
  if (store.rooms[roomId]) {
    return { success: false, error: 'Room already exists' };
  }

  // Initialize room with Maps as per specification
  store.rooms[roomId] = {
    roomId,
    teacher: {
      socketId: teacherSocketId,
      name: teacherName
    },
    students: new Map(), // Map<socketId, { name, hasAnswered }>
    activePoll: null,
    pollHistory: [],
    chat: [] // Track chat messages per room
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
 * SECURITY: Validates room exists and prevents duplicate names
 */
function addStudent(roomId, socketId, name, socketRef) {
  const room = getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check for duplicate student name in this room
  for (const [existingSocketId, student] of room.students) {
    if (student.name === name && existingSocketId !== socketId) {
      return { success: false, error: 'Student name already taken in this room' };
    }
  }

  room.students.set(socketId, {
    name,
    hasAnswered: false,
    socketRef
  });

  return { success: true };
}

/**
 * Remove a student from a specific room
 * SECURITY: If student was in activeStudents snapshot, remove them
 */
function removeStudent(roomId, socketId) {
  const room = getRoom(roomId);
  if (!room) return { success: false };

  room.students.delete(socketId);

  // CRITICAL: Remove from active students snapshot if poll is active
  if (room.activePoll && room.activePoll.activeStudents) {
    const index = room.activePoll.activeStudents.indexOf(socketId);
    if (index > -1) {
      room.activePoll.activeStudents.splice(index, 1);
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

  const students = [];
  for (const [socketId, data] of room.students) {
    students.push({
      socketId,
      name: data.name,
      hasAnswered: data.hasAnswered
    });
  }
  return students;
}

/**
 * Create a new poll in a specific room
 * SECURITY: Capture SNAPSHOT of active students at poll start
 * ANTI-CHEAT: Store correct answer server-side only
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

  // CRITICAL: Take SNAPSHOT of currently connected students
  const activeStudents = Array.from(room.students.keys());

  // Reset all students' hasAnswered status
  for (const [socketId, student] of room.students) {
    student.hasAnswered = false;
  }

  const startTime = Date.now();
  const durationMs = duration * 1000;

  // Create new poll with activeStudents snapshot and correct answer
  // Using 'activePoll' to match specification (was 'currentPoll')
  room.activePoll = {
    question,
    options,
    correctOptionIndex, // ANTI-CHEAT: Server-side only
    answers: new Map(), // Map<socketId, optionIndex>
    startTime,
    duration: durationMs,
    timerEndsAt: startTime + durationMs, // As per specification
    isActive: true,
    activeStudents: activeStudents, // SNAPSHOT - only these students count
    completionReason: null
  };

  return { success: true, poll: room.activePoll };
}

/**
 * Submit an answer to the current poll in a room
 * SECURITY: Validates student belongs to room and hasn't answered yet
 */
function submitAnswer(roomId, socketId, optionIndex) {
  const room = getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  if (!room.activePoll) {
    return { success: false, error: 'No active poll' };
  }

  const student = room.students.get(socketId);
  if (!student) {
    return { success: false, error: 'Student not in room' };
  }

  if (student.hasAnswered) {
    return { success: false, error: 'Already answered' };
  }

  // Check if poll time has expired
  const elapsed = Date.now() - room.activePoll.startTime;
  if (elapsed > room.activePoll.duration) {
    return { success: false, error: 'Poll time expired' };
  }

  // Record answer using Map
  room.activePoll.answers.set(socketId, optionIndex);
  student.hasAnswered = true;

  return { success: true };
}

/**
 * Get poll results with vote counts for a room
 * ANTI-CHEAT: Includes correct answer information (server-side only)
 */
function getPollResults(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.activePoll) {
    return null;
  }

  const results = room.activePoll.options.map(() => 0);
  
  // Count votes from Map
  for (const optionIndex of room.activePoll.answers.values()) {
    results[optionIndex]++;
  }

  return {
    question: room.activePoll.question,
    options: room.activePoll.options,
    correctOptionIndex: room.activePoll.correctOptionIndex,
    results,
    totalVotes: room.activePoll.answers.size,
    totalStudents: room.students.size,
    activeStudents: room.activePoll.activeStudents.length,
    startTime: room.activePoll.startTime,
    duration: room.activePoll.duration,
    timerEndsAt: room.activePoll.timerEndsAt,
    completionReason: room.activePoll.completionReason
  };
}

/**
 * SECURITY: Check if all ACTIVE students (from snapshot) have answered
 * New students joining mid-poll do NOT block completion
 */
function allActiveStudentsAnswered(roomId) {
  const room = getRoom(roomId);
  if (!room || !room.activePoll) return false;

  const { activeStudents } = room.activePoll;
  
  // If no active students at poll start, return true (edge case)
  if (!activeStudents || activeStudents.length === 0) return true;

  // Check if ALL students in the snapshot have answered
  return activeStudents.every(socketId => {
    // If student disconnected, they don't block (already removed from snapshot)
    const student = room.students.get(socketId);
    if (!student) return true;
    return student.hasAnswered;
  });
}

/**
 * End the current poll with a reason
 * @param {string} reason - "TIME_EXPIRED" | "ALL_ANSWERED"
 * SECURITY: Saves poll to history when ending
 */
function endPoll(roomId, reason) {
  const room = getRoom(roomId);
  if (!room || !room.activePoll) return { success: false };

  room.activePoll.isActive = false;
  room.activePoll.completionReason = reason;
  room.activePoll.endTime = Date.now();

  // Convert Map to object for history storage
  const answersObj = {};
  for (const [socketId, optionIndex] of room.activePoll.answers) {
    answersObj[socketId] = optionIndex;
  }

  // Save to poll history with complete data
  room.pollHistory.push({
    ...room.activePoll,
    answers: answersObj // Store as object in history
  });
  
  console.log(`Poll saved to history for room ${roomId}:`, room.activePoll.question);

  return { success: true, reason };
}

/**
 * SECURITY: Check if a new poll can be created
 * Poll is complete if: no active poll OR poll ended (by timer or all answered)
 */
function canCreateNewPoll(roomId) {
  const room = getRoom(roomId);
  if (!room) return false;

  // Can create if no poll exists
  if (!room.activePoll) return true;
  
  // Can create if current poll is not active (already ended)
  if (!room.activePoll.isActive) return true;

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
 * SECURITY: Reset a room's session (called when teacher session expires)
 * Disconnects all students and clears room data
 */
function resetSession(roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  // Disconnect all students
  for (const student of room.students.values()) {
    if (student.socketRef) {
      student.socketRef.disconnect(true);
    }
  }

  // Clear room data
  delete store.rooms[roomId];
  delete store.teacherSessionTimers[roomId];

  console.log(`Session reset for room: ${roomId}`);
}

/**
 * Update teacher socket ID (for reconnection)
 * SECURITY: Validates room exists
 */
function updateTeacherSocket(roomId, newSocketId) {
  const room = getRoom(roomId);
  if (!room) return { success: false };

  room.teacher.socketId = newSocketId;
  return { success: true };
}

/**
 * Get poll history for a room
 * Returns formatted past polls with results
 * ANTI-CHEAT: Includes correct answer information (revealed after poll ends)
 */
function getPollHistory(roomId) {
  const room = getRoom(roomId);
  if (!room) return [];

  // Format past polls with calculated results
  return room.pollHistory.map((poll, index) => {
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
      correctOptionIndex: poll.correctOptionIndex,
      results,
      percentages,
      totalVotes,
      startTime: poll.startTime,
      endTime: poll.endTime,
      completionReason: poll.completionReason
    };
  });
}

/**
 * Add a chat message to a room's history
 * SECURITY: All message metadata is server-determined
 */
function addChatMessage(roomId, message, senderSocketId, senderName, senderRole) {
  const room = getRoom(roomId);
  if (!room) return { success: false };

  const chatMessage = {
    message,
    senderSocketId,
    senderName,
    senderRole,
    timestamp: Date.now()
  };

  room.chat.push(chatMessage);
  return { success: true, chatMessage };
}

/**
 * Get chat history for a room
 */
function getChatHistory(roomId) {
  const room = getRoom(roomId);
  if (!room) return [];
  return room.chat;
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
  getPollHistory,
  addChatMessage,
  getChatHistory
};
