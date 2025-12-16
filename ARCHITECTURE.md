# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    React App                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Teacher   │  │  Student   │  │    Poll    │    │  │
│  │  │ Dashboard  │  │   Room     │  │ Components │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │         Redux Store                        │    │  │
│  │  │  ┌─────────────┐  ┌──────────────┐       │    │  │
│  │  │  │ Poll Slice  │  │ Student Slice│       │    │  │
│  │  │  └─────────────┘  └──────────────┘       │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │         Socket.io Client                   │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
                   WebSocket Connection
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express + Socket.io                      │  │
│  │  ┌────────────────────────────────────────────┐      │  │
│  │  │          Socket Event Handlers             │      │  │
│  │  │  • join_as_teacher / join_as_student      │      │  │
│  │  │  • create_poll                            │      │  │
│  │  │  • submit_answer                          │      │  │
│  │  │  • remove_student                         │      │  │
│  │  │  • send_message                           │      │  │
│  │  └────────────────────────────────────────────┘      │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────┐      │  │
│  │  │         In-Memory Store                    │      │  │
│  │  │  • students: Map<socketId, Student>       │      │  │
│  │  │  • currentPoll: Poll | null               │      │  │
│  │  │  • pastPolls: Poll[]                      │      │  │
│  │  └────────────────────────────────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Teacher Side
```
TeacherDashboard
├── CreatePoll
│   ├── Form inputs (question, options, duration)
│   └── Validation
├── PollResults
│   └── Live result charts
└── StudentsList
    └── Student cards with remove button

ChatPopup (shared)
```

### Student Side
```
StudentJoin
└── Name input form

PollRoom
├── Timer
├── PollCard
│   └── Option selection
└── PollResults
    └── Result display after answering

ChatPopup (shared)
```

---

## Data Flow

### Poll Creation Flow
```
1. Teacher fills CreatePoll form
   ↓
2. Validation on client
   ↓
3. emit('create_poll', data)
   ↓
4. Server validates
   ↓
5. Server creates poll in store
   ↓
6. Server → emit('poll_created') to teacher
   ↓
7. Server → emit('poll_started') to all students
   ↓
8. Students receive and display poll
   ↓
9. Redux updates currentPoll state
   ↓
10. Timer starts countdown
```

### Answer Submission Flow
```
1. Student selects option in PollCard
   ↓
2. Student clicks submit
   ↓
3. emit('submit_answer', optionIndex)
   ↓
4. Server validates (not duplicate, within time)
   ↓
5. Server stores answer in currentPoll.answers
   ↓
6. Server → emit('answer_submitted') to student
   ↓
7. Server → emit('live_results') to teacher
   ↓
8. Student sees results or waiting message
   ↓
9. Teacher sees updated vote counts
   ↓
10. If all answered → emit('poll_ended') to all
```

---

## State Management

### Redux Store Structure
```javascript
{
  poll: {
    currentPoll: {
      question: String,
      options: [String],
      duration: Number,
      startTime: Number
    },
    pollResults: {
      results: [Number],      // Vote counts
      totalVotes: Number,
      totalStudents: Number
    },
    hasAnswered: Boolean,
    userAnswer: Number,
    isPollActive: Boolean,
    timeRemaining: Number,
    students: [
      {
        socketId: String,
        name: String,
        hasAnswered: Boolean
      }
    ]
  },
  
  student: {
    name: String,
    socketId: String,
    isConnected: Boolean,
    isTeacher: Boolean,
    messages: [
      {
        id: Number,
        message: String,
        sender: String,
        timestamp: Number
      }
    ],
    showChat: Boolean
  }
}
```

### Server Store Structure
```javascript
{
  students: {
    [socketId]: {
      name: String,
      hasAnswered: Boolean,
      socketRef: Socket
    }
  },
  
  currentPoll: {
    question: String,
    options: [String],
    answers: {
      [socketId]: optionIndex
    },
    startTime: Number,
    duration: Number,
    isActive: Boolean
  },
  
  pastPolls: [
    {
      question: String,
      options: [String],
      answers: Object,
      startTime: Number,
      endTime: Number
    }
  ]
}
```

---

## Socket.io Room Structure

```
┌─────────────────────────────────────────┐
│           Socket.io Server              │
├─────────────────────────────────────────┤
│                                          │
│  Room: "teacher"                        │
│  ├── Teacher Socket 1                   │
│  └── (only one teacher typically)       │
│                                          │
│  Room: "students"                       │
│  ├── Student Socket 1 (Alice)          │
│  ├── Student Socket 2 (Bob)            │
│  ├── Student Socket 3 (Charlie)        │
│  └── Student Socket 4 (Diana)          │
│                                          │
│  Global (all sockets)                   │
│  └── Used for chat messages             │
│                                          │
└─────────────────────────────────────────┘

Broadcast Examples:
• io.to('teacher').emit() → Only teacher
• io.to('students').emit() → All students
• io.emit() → Everyone
• socket.emit() → Single socket
```

---

## Request/Response Patterns

### Teacher Creates Poll
```
Client (Teacher)              Server                 Client (Students)
     │                          │                          │
     │─create_poll──────────────>│                          │
     │                          │                          │
     │<───poll_created──────────│                          │
     │                          │                          │
     │                          │─poll_started─────────────>│
     │                          │                          │
     │                          │                   [Display Poll]
     │                          │                          │
```

### Student Submits Answer
```
Client (Student)              Server                 Client (Teacher)
     │                          │                          │
     │─submit_answer────────────>│                          │
     │                          │                          │
     │<───answer_submitted──────│                          │
     │                          │                          │
     │                          │─live_results─────────────>│
     │                          │                          │
[Show Results]                 │                   [Update Results]
     │                          │                          │
```

---

## Timer Mechanism

```
Poll Created
    ↓
startTime = Date.now()
duration = 60000ms (60s)
    ↓
Client-side Timer Loop (every 100ms):
    ↓
elapsed = Date.now() - startTime
remaining = duration - elapsed
    ↓
Update UI with remaining time
    ↓
If remaining <= 0:
    ↓
    Stop timer
    Disable submit
    ↓
Server-side Timer (setTimeout):
    ↓
After duration expires:
    ↓
    emit('poll_ended') to all
```

---

## Security Model

```
Input Layer (Client)
    ↓
    [Client-side Validation]
    • Length checks
    • Format checks
    • User feedback
    ↓
Network Layer
    ↓
    [Socket.io Transport]
    • WebSocket encryption (use WSS in prod)
    • CORS configuration
    ↓
Server Layer
    ↓
    [Server-side Validation]
    • Business logic checks
    • Duplicate prevention
    • Time limit enforcement
    • Input sanitization
    ↓
Data Layer (In-Memory)
    ↓
    [Store Operations]
    • Controlled access
    • No direct client access
    • Server is source of truth
```

---

## Deployment Architecture

### Development
```
┌────────────┐     ┌────────────┐
│  React     │     │   Node.js  │
│  Dev Server│────▶│   Server   │
│  :3000     │     │   :4000    │
└────────────┘     └────────────┘
   localhost          localhost
```

### Production (Example)
```
┌─────────────┐
│   Vercel    │
│  (Frontend) │
│   React     │
│   Static    │
└──────┬──────┘
       │
       │ HTTPS
       │
       ▼
┌─────────────┐
│   Heroku    │
│  (Backend)  │
│   Node.js   │
│  Socket.io  │
└─────────────┘
```

---

## Error Handling Flow

```
Error Occurs
    ↓
    ├─ Client-side Error
    │     ↓
    │     Validation Error
    │     Network Error
    │     Component Error
    │     ↓
    │     Display user message
    │     Log to console
    │     Prevent submission
    │
    └─ Server-side Error
          ↓
          Validation Error
          Business Logic Error
          Socket Error
          ↓
          emit('error_event', {message})
          ↓
          Client receives and displays
          ↓
          User sees friendly message
```

---

## Performance Optimizations

### Client-Side
```
1. Redux State Management
   • Centralized state
   • Selective re-renders
   • Memoization ready

2. Component Optimization
   • Functional components
   • useEffect cleanup
   • Conditional rendering

3. Socket Management
   • Connection pooling
   • Event listener cleanup
   • Reconnection logic
```

### Server-Side
```
1. In-Memory Storage
   • Fast read/write
   • O(1) lookups
   • No database latency

2. Event Broadcasting
   • Room-based targeting
   • Reduced network calls
   • Efficient updates

3. Timer Management
   • Single timer per poll
   • Cleanup on completion
   • No memory leaks
```

---

## Scalability Considerations

### Current Architecture
```
Handles: 20-50 concurrent users
Storage: In-memory (lost on restart)
State: Single server instance
```

### Future Scaling Options
```
1. Add Redis for state
   • Shared memory across instances
   • Persistent storage
   • Pub/sub for events

2. Load Balancing
   • Multiple server instances
   • Sticky sessions
   • Round-robin distribution

3. Database Integration
   • MongoDB for persistence
   • Poll history
   • User accounts
```

---

## Technology Stack Details

### Frontend Stack
```
React (18.2.0)
    ↓
React Router (6.14.2)
    ↓
Redux Toolkit (1.9.5)
    ↓
Socket.io Client (4.6.1)
    ↓
Plain CSS
```

### Backend Stack
```
Node.js (14+)
    ↓
Express (4.18.2)
    ↓
Socket.io (4.6.1)
    ↓
CORS (2.8.5)
```

---

## Development Workflow

```
1. Clone Repository
   ↓
2. Install Dependencies
   • npm install (root)
   • npm install (client)
   ↓
3. Start Development
   • Terminal 1: npm start (server)
   • Terminal 2: cd client && npm start
   ↓
4. Code Changes
   • Hot reload active
   • Check console
   • Test in browser
   ↓
5. Testing
   • Manual testing
   • Multiple tabs
   • Different scenarios
   ↓
6. Build for Production
   • cd client && npm run build
   • Set environment variables
   • Deploy
```

---

## File Dependencies

```
server/index.js
    ├── requires: express, socket.io, cors
    ├── imports: socket.js
    └── starts server

server/socket.js
    ├── imports: store.js
    └── exports: initializeSocket

server/store.js
    └── exports: all store functions

client/src/index.js
    ├── imports: App.js, store
    └── renders React app

client/src/App.js
    ├── imports: all page components
    └── defines routes

client/src/features/*/
    ├── imports: socket, Redux hooks
    └── exports: components
```

---

This architecture provides:
✅ Separation of concerns
✅ Scalable structure
✅ Maintainable code
✅ Clear data flow
✅ Real-time capabilities
✅ Error resilience
