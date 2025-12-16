/**
 * Socket.io event handlers - ROOM-BASED ARCHITECTURE
 * Manages real-time communication with multi-teacher support
 */

const {
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
  updateTeacherSocket,
  getPollHistory
} = require('./store');

// Track poll timers per room: { roomId: timeoutId }
let pollTimers = {};

/**
 * Initialize Socket.io handlers
 */
function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // ============================================
    // TEACHER: Join as teacher (creates/joins room)
    // ============================================
    socket.on('join_as_teacher', (data) => {
      const { roomId = 'default-room', teacherName = 'Teacher' } = data || {};
      
      let room = getRoom(roomId);
      
      // If room doesn't exist, create it
      if (!room) {
        const result = createRoom(roomId, socket.id, teacherName);
        if (!result.success) {
          socket.emit('teacher_error', { message: result.error });
          return;
        }
        room = result.room;
        console.log(`Room created: ${roomId} by ${socket.id}`);
      } else {
        // Room exists - teacher reconnecting
        updateTeacherSocket(roomId, socket.id);
        cancelTeacherSessionTimeout(roomId);
        console.log(`Teacher reconnected to room: ${roomId}`);
      }

      // Join the room
      socket.join(roomId);
      socket.join(`teacher-${roomId}`); // Teacher-specific broadcasts
      
      // IDENTITY FIX: Store complete identity on socket for chat
      socket.roomId = roomId;
      socket.role = 'teacher';
      socket.userName = room.teacherName || teacherName;

      // Send current state to teacher
      socket.emit('teacher_joined', {
        roomId,
        students: getAllStudents(roomId),
        currentPoll: getPollResults(roomId),
        pastPolls: room.pastPolls
      });

      console.log(`Teacher joined room ${roomId}:`, socket.id);
    });

    // ============================================
    // STUDENT: Join as student (with room ID)
    // ============================================
    socket.on('join_as_student', (data) => {
      const { name, roomId = 'default-room' } = data;

      // Validate room exists
      const room = getRoom(roomId);
      if (!room) {
        socket.emit('join_error', { message: 'Room not found' });
        return;
      }

      // Add student to room
      const result = addStudent(roomId, socket.id, name, socket);
      if (!result.success) {
        socket.emit('join_error', { message: result.error });
        return;
      }

      // Join the room
      socket.join(roomId);
      socket.join(`students-${roomId}`);
      
      // IDENTITY FIX: Store complete identity on socket for chat
      socket.roomId = roomId;
      socket.role = 'student';
      socket.userName = name;

      // Send current poll to the new student (if poll is active)
      if (room.currentPoll && room.currentPoll.isActive) {
        const timeRemaining = room.currentPoll.duration - (Date.now() - room.currentPoll.startTime);
        socket.emit('poll_started', {
          question: room.currentPoll.question,
          options: room.currentPoll.options,
          duration: room.currentPoll.duration,
          startTime: room.currentPoll.startTime,
          timeRemaining: Math.max(0, timeRemaining)
        });
      }

      // Notify teacher about new student
      io.to(`teacher-${roomId}`).emit('student_joined', {
        students: getAllStudents(roomId)
      });

      socket.emit('join_success', {
        name,
        socketId: socket.id,
        roomId
      });

      console.log(`Student joined room ${roomId}: ${name} (${socket.id})`);
    });

    // ============================================
    // TEACHER: Create new poll
    // ============================================
    socket.on('create_poll', (data) => {
      const { question, options, duration, correctOptionIndex } = data;
      console.log('CREATE_POLL received:', { question, options, duration, correctOptionIndex });
      const roomId = socket.roomId;

      if (!roomId) {
        socket.emit('poll_error', { message: 'Not in a room' });
        return;
      }

      // CRITICAL FIX: Validate that a new poll can be created
      if (!canCreateNewPoll(roomId)) {
        socket.emit('poll_error', {
          message: 'Cannot create poll: current poll is still active'
        });
        return;
      }

      // Create the poll (captures SNAPSHOT of active students + correct answer)
      const result = createPoll(roomId, question, options, duration || 60, correctOptionIndex);
      
      if (!result.success) {
        socket.emit('poll_error', { message: result.error });
        return;
      }

      const poll = result.poll;

      // Clear any existing timer for this room
      if (pollTimers[roomId]) {
        clearTimeout(pollTimers[roomId]);
      }

      // Broadcast to all students in the room (include correct answer)
      io.to(`students-${roomId}`).emit('poll_started', {
        question: poll.question,
        options: poll.options,
        correctOptionIndex: poll.correctOptionIndex, // NEW: Send correct answer to students
        duration: poll.duration,
        startTime: poll.startTime
      });

      // Send to teacher
      io.to(`teacher-${roomId}`).emit('poll_created', getPollResults(roomId));

      console.log(`Poll created in room ${roomId}: ${question}`);

      // CRITICAL FIX: Set timer to auto-end poll when time expires
      pollTimers[roomId] = setTimeout(() => {
        handlePollCompletion(roomId, 'TIME_EXPIRED', io);
      }, poll.duration);

      // CRITICAL FIX: Check immediately if all active students already answered
      // (edge case: if no students in room, poll should complete immediately)
      if (allActiveStudentsAnswered(roomId)) {
        clearTimeout(pollTimers[roomId]);
        handlePollCompletion(roomId, 'ALL_ANSWERED', io);
      }
    });

    // ============================================
    // STUDENT: Submit answer
    // ============================================
    socket.on('submit_answer', (optionIndex) => {
      const roomId = socket.roomId;

      if (!roomId) {
        socket.emit('answer_error', { message: 'Not in a room' });
        return;
      }

      const result = submitAnswer(roomId, socket.id, optionIndex);

      if (!result.success) {
        socket.emit('answer_error', { message: result.error });
        return;
      }

      // ANTI-CHEAT FIX: Only confirm submission, NO correctness info
      // Students must wait until poll ends to see if they were correct
      // This prevents sharing the correct answer during the poll
      socket.emit('answer_submitted', {
        optionIndex
        // NO isCorrect - prevents answer leakage
        // NO correctOptionIndex - prevents cheating
      });

      // Broadcast updated results to teacher (teacher sees live counts)
      const pollResults = getPollResults(roomId);
      io.to(`teacher-${roomId}`).emit('live_results', pollResults);

      console.log(`Answer submitted in room ${roomId} by ${socket.id}: option ${optionIndex}`);

      // TIMER-BASED: Poll continues until timer expires
      // Do NOT end early even if all students answered
    });

    // ============================================
    // TEACHER: Remove a student
    // ============================================
    socket.on('remove_student', (studentSocketId) => {
      const roomId = socket.roomId;

      if (!roomId) return;

      const studentSocket = io.sockets.sockets.get(studentSocketId);
      
      if (studentSocket) {
        studentSocket.emit('kicked', { message: 'You have been removed by the teacher' });
        studentSocket.disconnect(true);
      }

      // CRITICAL FIX: removeStudent now handles activeStudents snapshot removal
      removeStudent(roomId, studentSocketId);

      // Notify teacher
      io.to(`teacher-${roomId}`).emit('student_removed', {
        students: getAllStudents(roomId)
      });

      console.log(`Student removed from room ${roomId}:`, studentSocketId);

      // CRITICAL FIX: Check if poll should complete after student removal
      if (allActiveStudentsAnswered(roomId)) {
        if (pollTimers[roomId]) {
          clearTimeout(pollTimers[roomId]);
        }
        handlePollCompletion(roomId, 'ALL_ANSWERED', io);
      }
    });

    // ============================================
    // CHAT: Send message (room-scoped)
    // ============================================
    // ============================================
    // CHAT: Send message (IDENTITY FIX)
    // ============================================
    socket.on('send_message', (data) => {
      const { message } = data;
      const roomId = socket.roomId;
      
      if (!roomId) {
        console.log('ERROR: send_message - socket not in a room');
        return;
      }

      // IDENTITY FIX: Determine sender identity from SERVER, not client
      const senderSocketId = socket.id;
      const senderName = socket.userName || 'Unknown';
      const senderRole = socket.role || 'unknown';

      console.log(`Chat message in room ${roomId} from ${senderRole}: ${senderName}`);

      // Broadcast message to everyone in the room with SERVER-DETERMINED identity
      io.to(roomId).emit('new_message', {
        message,
        senderSocketId,
        senderName,
        senderRole, // 'teacher' or 'student'
        timestamp: Date.now()
      });
    });

    // ============================================
    // CHAT: Get participants list (IDENTITY FIX)
    // ============================================
    socket.on('get_participants', () => {
      const roomId = socket.roomId;
      
      if (!roomId) return;

      const room = getRoom(roomId);
      if (!room) return;

      // Build participants list from SERVER identity store
      const participants = [];

      // Add teacher
      participants.push({
        socketId: room.teacherSocketId,
        name: room.teacherName,
        role: 'teacher'
      });

      // Add all students
      Object.entries(room.students).forEach(([socketId, student]) => {
        participants.push({
          socketId,
          name: student.name,
          role: 'student'
        });
      });

      socket.emit('participants_list', participants);
    });

    // ============================================
    // TEACHER: Get poll history
    // ============================================
    socket.on('get_poll_history', () => {
      const roomId = socket.roomId;
      
      if (!roomId) {
        socket.emit('poll_history_error', { message: 'Not in a room' });
        return;
      }

      // Fetch and send poll history
      const history = getPollHistory(roomId);
      socket.emit('poll_history', history);

      console.log(`Poll history sent to room ${roomId}: ${history.length} polls`);
    });

    // ============================================
    // Handle disconnection
    // ============================================
    socket.on('disconnect', () => {
      const roomId = socket.roomId;
      const role = socket.role;

      if (role === 'teacher' && roomId) {
        // CRITICAL FIX: Teacher session timeout
        console.log(`Teacher disconnected from room ${roomId}, starting session timeout...`);
        
        startTeacherSessionTimeout(roomId, (expiredRoomId) => {
          // Notify all students that room has been closed
          io.to(expiredRoomId).emit('room_closed', {
            message: 'Teacher session expired. Room has been closed.'
          });
        });
      }

      if (role === 'student' && roomId) {
        // CRITICAL FIX: Remove from activeStudents snapshot if poll is active
        removeStudent(roomId, socket.id);

        // Notify teacher about student leaving
        io.to(`teacher-${roomId}`).emit('student_left', {
          students: getAllStudents(roomId)
        });

        console.log(`Student disconnected from room ${roomId}:`, socket.id);

        // TIMER-BASED: Poll continues until timer expires
        // Do NOT end early even if all students answered
      }

      console.log('Connection closed:', socket.id);
    });
  });
}

/**
 * ANTI-CHEAT FIX: Centralized poll completion handler
 * Calculates correctness for each student ONLY when poll ends
 * All students receive results simultaneously
 */
function handlePollCompletion(roomId, reason, io) {
  endPoll(roomId, reason);
  const results = getPollResults(roomId);
  const room = getRoom(roomId);
  
  if (!room) return;

  // ANTI-CHEAT: Calculate correctness for each student who answered
  const studentResults = {};
  Object.entries(room.currentPoll.answers).forEach(([socketId, optionIndex]) => {
    studentResults[socketId] = {
      optionIndex,
      isCorrect: optionIndex === results.correctOptionIndex
    };
  });

  // Send results to each student with THEIR specific correctness
  Object.keys(room.students).forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('poll_ended', {
        ...results,
        myAnswer: studentResults[socketId] || null // null if didn't answer
      });
    }
  });

  // Send results to teacher (no individual student correctness)
  io.to(`teacher-${roomId}`).emit('poll_ended', results);
  
  console.log(`Poll ended in room ${roomId}: ${reason}`);
}

module.exports = { initializeSocket };
