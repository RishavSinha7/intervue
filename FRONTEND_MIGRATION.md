# Frontend Migration Guide

## Overview
This guide helps you update the frontend to work with the new **room-based backend architecture**.

---

## Required Changes

### 1. Teacher Join Event

**BEFORE:**
```javascript
socket.emit('join_as_teacher');
```

**AFTER:**
```javascript
socket.emit('join_as_teacher', {
  roomId: 'default-room',  // Or generate unique room ID
  teacherName: 'Teacher'   // Optional
});
```

**Listening for Response:**
```javascript
socket.on('teacher_joined', (data) => {
  const { roomId, students, currentPoll, pastPolls } = data;
  // Store roomId in state for later use
  dispatch(setRoomId(roomId));
});
```

---

### 2. Student Join Event

**BEFORE:**
```javascript
socket.emit('join_as_student', studentName);
```

**AFTER:**
```javascript
socket.emit('join_as_student', {
  name: studentName,
  roomId: 'default-room'  // Must match teacher's room
});
```

**Listening for Response:**
```javascript
socket.on('join_success', (data) => {
  const { name, socketId, roomId } = data;
  // Student successfully joined
});

socket.on('join_error', (data) => {
  const { message } = data;
  // Room not found or other error
  alert(`Error: ${message}`);
});
```

---

### 3. New Error Events

**Room Not Found:**
```javascript
socket.on('join_error', ({ message }) => {
  console.error('Join failed:', message);
  // Show error to user
});
```

**Teacher Session Expired:**
```javascript
socket.on('room_closed', ({ message }) => {
  console.warn('Room closed:', message);
  // Redirect student to home page
  navigate('/');
});
```

---

### 4. Poll Ended Event (Enhanced)

**Updated Payload:**
```javascript
socket.on('poll_ended', (results) => {
  const {
    question,
    options,
    results,
    totalVotes,
    totalStudents,
    activeStudents,      // NEW: Students at poll start
    completionReason     // NEW: "TIME_EXPIRED" | "ALL_ANSWERED"
  } = results;
  
  // Show completion reason to users
  if (completionReason === 'TIME_EXPIRED') {
    console.log('Poll ended: Time expired');
  } else if (completionReason === 'ALL_ANSWERED') {
    console.log('Poll ended: All students answered');
  }
});
```

---

## Minimal Changes (Default Room)

If you want to **minimize frontend changes**, use a **default room** approach:

### Option A: Single Global Room

```javascript
const DEFAULT_ROOM = 'default-room';

// Teacher
socket.emit('join_as_teacher', { roomId: DEFAULT_ROOM });

// Student
socket.emit('join_as_student', { name: studentName, roomId: DEFAULT_ROOM });
```

**Behavior:**
- All teachers share one room (first-come-first-serve)
- All students join the same room
- Works like the old global system

---

### Option B: Generate Room ID on Frontend

```javascript
// Teacher creates room
const teacherRoomId = `room-${Date.now()}`;
socket.emit('join_as_teacher', { roomId: teacherRoomId });

// Display room ID to teacher
console.log('Room ID:', teacherRoomId);

// Teacher shares room ID with students
// Students enter room ID to join
const studentRoomId = prompt('Enter Room ID');
socket.emit('join_as_student', { name: studentName, roomId: studentRoomId });
```

**Behavior:**
- Each teacher gets unique room
- Students must enter room ID to join
- Full multi-room support

---

## Redux Slice Updates

### Add Room ID to State

```javascript
// pollSlice.js
const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    roomId: null,        // NEW
    pollStarted: false,
    currentPoll: null,
    // ...
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    // ...
  }
});
```

### Use Room ID in Components

```javascript
// TeacherDashboard.jsx
const roomId = useSelector((state) => state.poll.roomId);

useEffect(() => {
  socket.on('teacher_joined', (data) => {
    dispatch(setRoomId(data.roomId));
  });
}, []);
```

---

## Complete Example: Teacher Flow

```javascript
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from './socket';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const roomId = useSelector(state => state.poll.roomId);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // Join as teacher with default room
    socket.emit('join_as_teacher', {
      roomId: 'default-room',
      teacherName: 'Teacher'
    });

    // Listen for confirmation
    socket.on('teacher_joined', (data) => {
      console.log('Joined room:', data.roomId);
      dispatch(setRoomId(data.roomId));
      setJoined(true);
    });

    return () => {
      socket.off('teacher_joined');
    };
  }, []);

  if (!joined) {
    return <div>Joining room...</div>;
  }

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <p>Room ID: {roomId}</p>
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

## Complete Example: Student Flow

```javascript
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from './socket';

function StudentJoin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    socket.emit('join_as_student', {
      name: name,
      roomId: 'default-room'  // Or get from user input
    });
  };

  useEffect(() => {
    // Success
    socket.on('join_success', (data) => {
      console.log('Joined room:', data.roomId);
      dispatch(setStudentName(data.name));
      navigate('/poll-room');
    });

    // Error
    socket.on('join_error', (data) => {
      setError(data.message);
    });

    // Room closed
    socket.on('room_closed', (data) => {
      alert(data.message);
      navigate('/');
    });

    return () => {
      socket.off('join_success');
      socket.off('join_error');
      socket.off('room_closed');
    };
  }, []);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleJoin}>Join</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## Testing Checklist

### Teacher
- [ ] Join with default room works
- [ ] Creating poll works
- [ ] Seeing live results works
- [ ] Removing students works
- [ ] Session persists on refresh (within 5 min)

### Student
- [ ] Join with default room works
- [ ] See poll when joining mid-poll works
- [ ] Submit answer works
- [ ] Receive poll ended notification works
- [ ] Receive room closed notification (after 5 min teacher disconnect)

### Edge Cases
- [ ] Multiple students join mid-poll → Poll completes based on snapshot
- [ ] Student disconnects during poll → Poll can complete
- [ ] Teacher disconnects and reconnects → Session restored
- [ ] Teacher disconnects for 6 min → Room cleaned up

---

## Backward Compatibility

The backend **is NOT backward compatible** with the old frontend. You must update the `join_as_teacher` and `join_as_student` events.

**Minimum required changes:**
1. Update join events to include `roomId`
2. Add listeners for `join_error` and `room_closed`
3. Store `roomId` in Redux state

---

## Summary

| Component | Change Required | Complexity |
|-----------|----------------|------------|
| Teacher join | Add `roomId` parameter | Low |
| Student join | Add `roomId` parameter | Low |
| Error handling | Add `join_error`, `room_closed` listeners | Low |
| Poll ended | Use new `completionReason` field | Optional |
| Redux state | Add `roomId` field | Low |

**Estimated migration time:** 30-60 minutes

---

**Need Help?** Check [BACKEND_REFACTOR.md](BACKEND_REFACTOR.md) for backend details.
