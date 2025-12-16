# Socket.io API Documentation

## Overview

This document describes all Socket.io events used in the Live Polling System.

**Server URL:** `http://localhost:4000` (default)

**Connection Method:** Socket.io WebSocket

---

## Client → Server Events

Events emitted by clients (teacher/student) to the server.

### 1. join_as_teacher

**Description:** Teacher connects to the system

**Emitted by:** Teacher client

**Payload:** None

**Example:**
```javascript
socket.emit('join_as_teacher');
```

**Server Response:**
- Emits `teacher_joined` back to teacher
- Joins teacher to "teacher" room

---

### 2. join_as_student

**Description:** Student joins the polling session

**Emitted by:** Student client

**Payload:**
```javascript
{
  name: String  // Student's name (2-30 chars)
}
```

**Example:**
```javascript
socket.emit('join_as_student', 'Alice');
```

**Server Response:**
- Adds student to students list
- Emits `join_success` to student
- Emits `student_joined` to teacher
- Sends current poll if active

**Validation:**
- Name must be 2-30 characters
- Trimmed and sanitized

---

### 3. create_poll

**Description:** Teacher creates a new poll

**Emitted by:** Teacher client

**Payload:**
```javascript
{
  question: String,      // Poll question (max 200 chars)
  options: [String],     // Array of options (2-6 items, max 100 chars each)
  duration: Number       // Time limit in seconds (10-300)
}
```

**Example:**
```javascript
socket.emit('create_poll', {
  question: 'What is your favorite color?',
  options: ['Red', 'Blue', 'Green', 'Yellow'],
  duration: 60
});
```

**Server Response:**
- Emits `poll_started` to all students
- Emits `poll_created` to teacher
- Starts auto-end timer

**Validation:**
- Can only create if no active poll OR all students answered
- Question required
- Minimum 2 options
- Duration between 10-300 seconds

**Error Response:**
- Emits `poll_error` if validation fails

---

### 4. submit_answer

**Description:** Student submits answer to current poll

**Emitted by:** Student client

**Payload:**
```javascript
optionIndex: Number  // Index of selected option (0-based)
```

**Example:**
```javascript
socket.emit('submit_answer', 2);  // Selects third option
```

**Server Response:**
- Emits `answer_submitted` to student
- Emits `live_results` to teacher
- Checks if all students answered
- May emit `poll_ended` if all answered

**Validation:**
- Must have active poll
- Student hasn't answered yet
- Poll time hasn't expired
- Valid option index

**Error Response:**
- Emits `answer_error` if validation fails

---

### 5. remove_student

**Description:** Teacher removes a student from session

**Emitted by:** Teacher client

**Payload:**
```javascript
studentSocketId: String  // Socket ID of student to remove
```

**Example:**
```javascript
socket.emit('remove_student', 'abc123xyz');
```

**Server Response:**
- Emits `kicked` to removed student
- Disconnects student
- Emits `student_removed` to teacher
- Updates students list

---

### 6. send_message

**Description:** Send chat message (BONUS feature)

**Emitted by:** Teacher or Student client

**Payload:**
```javascript
{
  message: String,  // Message text (max 200 chars)
  sender: String    // Sender name
}
```

**Example:**
```javascript
socket.emit('send_message', {
  message: 'Hello everyone!',
  sender: 'Teacher'
});
```

**Server Response:**
- Broadcasts `new_message` to all connected clients

---

## Server → Client Events

Events emitted by server to clients.

### 1. teacher_joined

**Description:** Confirmation of teacher connection with current state

**Sent to:** Teacher only

**Payload:**
```javascript
{
  students: [
    {
      socketId: String,
      name: String,
      hasAnswered: Boolean
    }
  ],
  currentPoll: {
    question: String,
    options: [String],
    results: [Number],
    totalVotes: Number,
    totalStudents: Number,
    startTime: Number,
    duration: Number
  } | null,
  pastPolls: [Object]  // Array of past polls
}
```

**Example:**
```javascript
socket.on('teacher_joined', (data) => {
  console.log('Students:', data.students);
  console.log('Current Poll:', data.currentPoll);
});
```

---

### 2. join_success

**Description:** Confirmation of student join

**Sent to:** Student only (who joined)

**Payload:**
```javascript
{
  name: String,
  socketId: String
}
```

**Example:**
```javascript
socket.on('join_success', (data) => {
  console.log('Joined as:', data.name);
  console.log('Socket ID:', data.socketId);
});
```

---

### 3. poll_started

**Description:** New poll has been created

**Sent to:** All students

**Payload:**
```javascript
{
  question: String,
  options: [String],
  duration: Number,      // Duration in milliseconds
  startTime: Number,     // Timestamp
  timeRemaining: Number  // For late joiners
}
```

**Example:**
```javascript
socket.on('poll_started', (poll) => {
  console.log('Question:', poll.question);
  console.log('Options:', poll.options);
  console.log('Duration:', poll.duration / 1000, 'seconds');
});
```

---

### 4. poll_created

**Description:** Poll created confirmation with initial results

**Sent to:** Teacher only

**Payload:**
```javascript
{
  question: String,
  options: [String],
  results: [Number],     // Vote counts (all zeros initially)
  totalVotes: Number,
  totalStudents: Number,
  startTime: Number,
  duration: Number
}
```

**Example:**
```javascript
socket.on('poll_created', (results) => {
  console.log('Poll created:', results.question);
});
```

---

### 5. answer_submitted

**Description:** Confirmation that answer was recorded

**Sent to:** Student who submitted

**Payload:**
```javascript
{
  optionIndex: Number,
  results: {
    question: String,
    options: [String],
    results: [Number],
    totalVotes: Number,
    totalStudents: Number
  }
}
```

**Example:**
```javascript
socket.on('answer_submitted', (data) => {
  console.log('Your answer:', data.optionIndex);
  console.log('Results:', data.results);
});
```

---

### 6. live_results

**Description:** Real-time poll results update

**Sent to:** Teacher only

**Payload:**
```javascript
{
  question: String,
  options: [String],
  results: [Number],     // Updated vote counts
  totalVotes: Number,
  totalStudents: Number,
  startTime: Number,
  duration: Number
}
```

**Example:**
```javascript
socket.on('live_results', (results) => {
  console.log('Total votes:', results.totalVotes);
  console.log('Vote distribution:', results.results);
});
```

---

### 7. poll_ended

**Description:** Poll has concluded

**Sent to:** All clients (teacher and students)

**Payload:**
```javascript
{
  question: String,
  options: [String],
  results: [Number],
  totalVotes: Number,
  totalStudents: Number,
  startTime: Number,
  duration: Number
}
```

**Example:**
```javascript
socket.on('poll_ended', (results) => {
  console.log('Poll ended!');
  console.log('Final results:', results);
});
```

**Triggers:**
- Timer expires
- All students answered

---

### 8. student_joined

**Description:** New student connected

**Sent to:** Teacher only

**Payload:**
```javascript
{
  students: [
    {
      socketId: String,
      name: String,
      hasAnswered: Boolean
    }
  ]
}
```

**Example:**
```javascript
socket.on('student_joined', (data) => {
  console.log('Updated students:', data.students);
});
```

---

### 9. student_left

**Description:** Student disconnected

**Sent to:** Teacher only

**Payload:**
```javascript
{
  students: [
    {
      socketId: String,
      name: String,
      hasAnswered: Boolean
    }
  ]
}
```

**Example:**
```javascript
socket.on('student_left', (data) => {
  console.log('Students remaining:', data.students);
});
```

---

### 10. student_removed

**Description:** Student was removed by teacher

**Sent to:** Teacher only

**Payload:**
```javascript
{
  students: [
    {
      socketId: String,
      name: String,
      hasAnswered: Boolean
    }
  ]
}
```

**Example:**
```javascript
socket.on('student_removed', (data) => {
  console.log('Student removed. Remaining:', data.students);
});
```

---

### 11. kicked

**Description:** Student has been removed from session

**Sent to:** Kicked student only

**Payload:**
```javascript
{
  message: String  // Reason for removal
}
```

**Example:**
```javascript
socket.on('kicked', (data) => {
  console.log('Kicked:', data.message);
  // Disconnect and show message to user
});
```

---

### 12. poll_error

**Description:** Error in poll creation

**Sent to:** Teacher who attempted creation

**Payload:**
```javascript
{
  message: String  // Error description
}
```

**Example:**
```javascript
socket.on('poll_error', (data) => {
  console.error('Poll error:', data.message);
  alert(data.message);
});
```

**Common Errors:**
- "Cannot create poll: current poll is still active..."

---

### 13. answer_error

**Description:** Error in answer submission

**Sent to:** Student who attempted submission

**Payload:**
```javascript
{
  message: String  // Error description
}
```

**Example:**
```javascript
socket.on('answer_error', (data) => {
  console.error('Answer error:', data.message);
  alert(data.message);
});
```

**Common Errors:**
- "No active poll"
- "Already answered"
- "Poll time expired"

---

### 14. new_message

**Description:** Chat message received (BONUS)

**Sent to:** All clients

**Payload:**
```javascript
{
  message: String,
  sender: String,
  timestamp: Number  // Unix timestamp
}
```

**Example:**
```javascript
socket.on('new_message', (data) => {
  console.log(`${data.sender}: ${data.message}`);
  console.log('Time:', new Date(data.timestamp));
});
```

---

## Connection Events

Standard Socket.io connection events.

### connect

**Description:** Successfully connected to server

**Example:**
```javascript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

---

### disconnect

**Description:** Disconnected from server

**Payload:**
```javascript
reason: String  // Reason for disconnection
```

**Example:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Handle reconnection or show message
});
```

---

### connect_error

**Description:** Connection failed

**Example:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Event Flow Diagrams

### Poll Creation Flow
```
Teacher → create_poll
  ↓
Server validates
  ↓
Server → poll_created (to teacher)
Server → poll_started (to all students)
  ↓
Timer starts
```

### Answer Submission Flow
```
Student → submit_answer
  ↓
Server validates
  ↓
Server → answer_submitted (to student)
Server → live_results (to teacher)
  ↓
Check if all answered
  ↓
If yes → poll_ended (to all)
```

### Student Join Flow
```
Student → join_as_student
  ↓
Server adds to list
  ↓
Server → join_success (to student)
Server → student_joined (to teacher)
  ↓
If poll active → poll_started (to new student)
```

---

## Error Handling

### Client-Side
```javascript
// Set up error handlers
socket.on('poll_error', handlePollError);
socket.on('answer_error', handleAnswerError);
socket.on('connect_error', handleConnectionError);
socket.on('disconnect', handleDisconnect);
```

### Server-Side
```javascript
// Validation before emitting
if (!canCreatePoll()) {
  socket.emit('poll_error', { 
    message: 'Cannot create poll...' 
  });
  return;
}
```

---

## Best Practices

1. **Always clean up listeners:**
   ```javascript
   useEffect(() => {
     socket.on('poll_started', handler);
     return () => socket.off('poll_started', handler);
   }, []);
   ```

2. **Handle disconnections gracefully:**
   ```javascript
   socket.on('disconnect', () => {
     // Show reconnecting message
     // Attempt reconnection
   });
   ```

3. **Validate data on both sides:**
   - Client-side for UX
   - Server-side for security

4. **Use rooms for targeted broadcasts:**
   ```javascript
   io.to('teacher').emit('event', data);
   io.to('students').emit('event', data);
   ```

---

## Testing Events

Use Socket.io client library for testing:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:4000');

// Test join
socket.emit('join_as_student', 'TestUser');

// Listen for confirmation
socket.on('join_success', (data) => {
  console.log('Join successful:', data);
});

// Test poll answer
socket.emit('submit_answer', 0);
```

---

## Rate Limiting (Future Enhancement)

Consider adding rate limiting:

```javascript
const rateLimiter = {
  'create_poll': { limit: 10, window: 60000 },  // 10 per minute
  'submit_answer': { limit: 1, window: 1000 },  // 1 per second
  'send_message': { limit: 30, window: 60000 }  // 30 per minute
};
```

---

## Security Considerations

1. **Validate all inputs server-side**
2. **Sanitize user input**
3. **Use socket.id as identifier (non-guessable)**
4. **Implement rate limiting**
5. **Use CORS properly**
6. **Consider authentication for production**

---

**API Version:** 1.0
**Last Updated:** December 2024
**Server:** Node.js + Socket.io
**Client:** React + Socket.io-client
