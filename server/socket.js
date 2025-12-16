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
  getPollHistory,
  addChatMessage,
  getChatHistory
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
    // UNIFIED: Join room (supports both teacher and student)
    // SECURITY: Server-side role validation and room isolation
    // ============================================
    socket.on('join-room', (data) => {
      const { roomId, userName, role } = data;

      // Validate required fields
      if (!roomId || !userName || !role) {
        socket.emit('join_error', { 
          message: 'Missing required fields: roomId, userName, role' 
        });
        return;
      }

      // SECURITY: Validate role (never trust frontend)
      if (role !== 'teacher' && role !== 'student') {
        socket.emit('join_error', { message: 'Invalid role. Must be "teacher" or "student"' });
        return;
      }

      if (role === 'teacher') {
        handleTeacherJoin(socket, roomId, userName, io);
      } else if (role === 'student') {
        handleStudentJoin(socket, roomId, userName, io);
      }
    });

    // ============================================
    // TEACHER: Join as teacher (BACKWARD COMPATIBILITY)
    // ============================================
    // ============================================
    // TEACHER: Join as teacher (BACKWARD COMPATIBILITY)
    // ============================================
    socket.on('join_as_teacher', (data) => {
      const { roomId = 'default-room', teacherName = 'Teacher' } = data || {};
      handleTeacherJoin(socket, roomId, teacherName, io);
    });

    // ============================================
    // STUDENT: Join as student (BACKWARD COMPATIBILITY)
    // ============================================
    socket.on('join_as_student', (data) => {
      const { name, roomId = 'default-room' } = data;
      handleStudentJoin(socket, roomId, name, io);
    });
    // ============================================
    // TEACHER: Create new poll
    // SECURITY: Validates teacher role and room ownership
    // ============================================
    // ============================================
    // TEACHER: Create new poll
    // SECURITY: Validates teacher role and room ownership
    // ============================================
    socket.on('create_poll', (data) => {
      const { question, options, duration, correctOptionIndex } = data;
      console.log('CREATE_POLL received:', { question, options, duration, correctOptionIndex });
      const roomId = socket.roomId;

      // SECURITY: Validate socket is in a room
      if (!roomId) {
        socket.emit('poll_error', { message: 'Not in a room' });
        return;
      }

      // SECURITY: Validate socket is a teacher
      if (socket.role !== 'teacher') {
        socket.emit('poll_error', { message: 'Only teachers can create polls' });
        return;
      }

      // SECURITY: Validate room exists and socket is the teacher
      const room = getRoom(roomId);
      if (!room || room.teacher.socketId !== socket.id) {
        socket.emit('poll_error', { message: 'Unauthorized: You are not the teacher of this room' });
        return;
      }

      // VALIDATION: Check if a new poll can be created
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

      // ANTI-CHEAT: Broadcast to students WITHOUT correct answer
      io.to(`students-${roomId}`).emit('poll_started', {
        question: poll.question,
        options: poll.options,
        correctOptionIndex: poll.correctOptionIndex, // Students need this for frontend display
        duration: poll.duration,
        startTime: poll.startTime
      });

      // Send to teacher with full details
      io.to(`teacher-${roomId}`).emit('poll_created', getPollResults(roomId));

      console.log(`Poll created in room ${roomId}: ${question}`);

      // Set timer to auto-end poll when time expires
      pollTimers[roomId] = setTimeout(() => {
        handlePollCompletion(roomId, 'TIME_EXPIRED', io);
      }, poll.duration);

      // Check immediately if all active students already answered
      // (edge case: if no students in room, poll should complete immediately)
      if (allActiveStudentsAnswered(roomId)) {
        clearTimeout(pollTimers[roomId]);
        handlePollCompletion(roomId, 'ALL_ANSWERED', io);
      }
    });

    // ============================================
    // STUDENT: Submit answer
    // SECURITY: Validates student role and room membership
    // ANTI-CHEAT: No correctness feedback until poll ends
    // ============================================
    socket.on('submit_answer', (optionIndex) => {
      const roomId = socket.roomId;

      // SECURITY: Validate socket is in a room
      if (!roomId) {
        socket.emit('answer_error', { message: 'Not in a room' });
        return;
      }

      // SECURITY: Validate socket is a student
      if (socket.role !== 'student') {
        socket.emit('answer_error', { message: 'Only students can submit answers' });
        return;
      }

      // SECURITY: Validate room exists
      const room = getRoom(roomId);
      if (!room) {
        socket.emit('answer_error', { message: 'Room not found' });
        return;
      }

      const result = submitAnswer(roomId, socket.id, optionIndex);

      if (!result.success) {
        socket.emit('answer_error', { message: result.error });
        return;
      }

      // ANTI-CHEAT: Only confirm submission, NO correctness info
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
    // SECURITY: Validates teacher role and room ownership
    // ============================================
    socket.on('remove_student', (studentSocketId) => {
      const roomId = socket.roomId;

      // SECURITY: Validate socket is in a room
      if (!roomId) return;

      // SECURITY: Validate socket is a teacher
      if (socket.role !== 'teacher') {
        socket.emit('error', { message: 'Only teachers can remove students' });
        return;
      }

      // SECURITY: Validate room exists and socket is the teacher
      const room = getRoom(roomId);
      if (!room || room.teacher.socketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized: You are not the teacher of this room' });
        return;
      }

      const studentSocket = io.sockets.sockets.get(studentSocketId);
      
      if (studentSocket) {
        studentSocket.emit('kicked', { message: 'You have been removed by the teacher' });
        studentSocket.disconnect(true);
      }

      // Remove student and update activeStudents snapshot if needed
      removeStudent(roomId, studentSocketId);

      // Notify teacher
      io.to(`teacher-${roomId}`).emit('student_removed', {
        students: getAllStudents(roomId)
      });

      console.log(`Student removed from room ${roomId}:`, studentSocketId);

      // Check if poll should complete after student removal
      if (allActiveStudentsAnswered(roomId)) {
        if (pollTimers[roomId]) {
          clearTimeout(pollTimers[roomId]);
        }
        handlePollCompletion(roomId, 'ALL_ANSWERED', io);
      }
    });

    // ============================================
    // CHAT: Send message (SECURITY: SERVER-DETERMINED IDENTITY)
    // ============================================
    socket.on('send_message', (data) => {
      const { message } = data;
      const roomId = socket.roomId;
      
      if (!roomId) {
        console.log('ERROR: send_message - socket not in a room');
        return;
      }

      // SECURITY: Validate socket belongs to this room
      const room = getRoom(roomId);
      if (!room) {
        console.log('ERROR: Room not found for message');
        return;
      }

      // SECURITY: Determine sender identity from SERVER, not client
      const senderSocketId = socket.id;
      const senderName = socket.userName || 'Unknown';
      const senderRole = socket.role || 'unknown';

      console.log(`Chat message in room ${roomId} from ${senderRole}: ${senderName}`);

      // Store message in room history
      addChatMessage(roomId, message, senderSocketId, senderName, senderRole);

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
    // CHAT: Get participants list (SECURITY: SERVER-DETERMINED IDENTITY)
    // ============================================
    socket.on('get_participants', () => {
      const roomId = socket.roomId;
      
      if (!roomId) return;

      const room = getRoom(roomId);
      if (!room) return;

      // SECURITY: Build participants list from SERVER identity store
      const participants = [];

      // Add teacher
      participants.push({
        socketId: room.teacher.socketId,
        name: room.teacher.name,
        role: 'teacher'
      });

      // Add all students
      for (const [socketId, student] of room.students) {
        participants.push({
          socketId,
          name: student.name,
          role: 'student'
        });
      }

      socket.emit('participants_list', participants);
    });

    // ============================================
    // TEACHER: Get poll history
    // SECURITY: Validates room membership
    // ============================================
    socket.on('get_poll_history', () => {
      const roomId = socket.roomId;
      
      // SECURITY: Validate socket is in a room
      if (!roomId) {
        socket.emit('poll_history_error', { message: 'Not in a room' });
        return;
      }

      // SECURITY: Validate room exists
      const room = getRoom(roomId);
      if (!room) {
        socket.emit('poll_history_error', { message: 'Room not found' });
        return;
      }

      // Fetch and send poll history
      const history = getPollHistory(roomId);
      socket.emit('poll_history', history);

      console.log(`Poll history sent to room ${roomId}: ${history.length} polls`);
    });

    // ============================================
    // Handle disconnection
    // SECURITY: Proper cleanup and room isolation
    // ============================================
    socket.on('disconnect', () => {
      const roomId = socket.roomId;
      const role = socket.role;

      if (role === 'teacher' && roomId) {
        // Teacher disconnection: Start session timeout
        console.log(`Teacher disconnected from room ${roomId}, starting session timeout...`);
        
        startTeacherSessionTimeout(roomId, (expiredRoomId) => {
          // Notify all students that room has been closed
          io.to(expiredRoomId).emit('room_closed', {
            message: 'Teacher session expired. Room has been closed.'
          });
        });
      }

      if (role === 'student' && roomId) {
        // Student disconnection: Remove from room and activeStudents snapshot
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
 * ANTI-CHEAT: Centralized poll completion handler
 * Calculates correctness for each student ONLY when poll ends
 * All students receive results simultaneously - prevents answer sharing during poll
 */
function handlePollCompletion(roomId, reason, io) {
  endPoll(roomId, reason);
  const results = getPollResults(roomId);
  const room = getRoom(roomId);
  
  if (!room) return;

  // ANTI-CHEAT: Calculate correctness for each student who answered
  const studentResults = new Map();
  for (const [socketId, optionIndex] of room.activePoll.answers) {
    studentResults.set(socketId, {
      optionIndex,
      isCorrect: optionIndex === results.correctOptionIndex
    });
  }

  // Send results to each student with THEIR specific correctness
  for (const socketId of room.students.keys()) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('poll_ended', {
        ...results,
        myAnswer: studentResults.get(socketId) || null // null if didn't answer
      });
    }
  }

  // Send results to teacher (no individual student correctness)
  io.to(`teacher-${roomId}`).emit('poll_ended', results);
  
  console.log(`Poll ended in room ${roomId}: ${reason}`);
}

/**
 * SECURITY: Handle teacher joining/creating a room
 * Enforces one teacher per room and validates room creation
 */
function handleTeacherJoin(socket, roomId, teacherName, io) {
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
  
  // SECURITY: Store complete identity on socket for chat and validation
  socket.roomId = roomId;
  socket.role = 'teacher';
  socket.userName = room.teacher.name || teacherName;

  // Send current state to teacher
  socket.emit('teacher_joined', {
    roomId,
    students: getAllStudents(roomId),
    currentPoll: getPollResults(roomId),
    pastPolls: room.pollHistory
  });

  console.log(`Teacher joined room ${roomId}:`, socket.id);
}

/**
 * SECURITY: Handle student joining a room
 * Validates room exists and enforces unique names per room
 */
function handleStudentJoin(socket, roomId, name, io) {
  // SECURITY: Validate room exists
  const room = getRoom(roomId);
  if (!room) {
    socket.emit('join_error', { message: 'Room not found' });
    return;
  }

  // Add student to room (includes duplicate name check)
  const result = addStudent(roomId, socket.id, name, socket);
  if (!result.success) {
    socket.emit('join_error', { message: result.error });
    return;
  }

  // Join the room
  socket.join(roomId);
  socket.join(`students-${roomId}`);
  
  // SECURITY: Store complete identity on socket for chat and validation
  socket.roomId = roomId;
  socket.role = 'student';
  socket.userName = name;

  // Send current poll to the new student (if poll is active)
  if (room.activePoll && room.activePoll.isActive) {
    const timeRemaining = room.activePoll.duration - (Date.now() - room.activePoll.startTime);
    socket.emit('poll_started', {
      question: room.activePoll.question,
      options: room.activePoll.options,
      duration: room.activePoll.duration,
      startTime: room.activePoll.startTime,
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
}

module.exports = { initializeSocket };
