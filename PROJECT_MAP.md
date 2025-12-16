# 🗺️ Live Polling System - Project Map

## Complete File Structure

```
d:\intervue\
│
├── 📄 Documentation Files (Root)
│   ├── INDEX.md                    ← Start here! Documentation guide
│   ├── README.md                   ← Main project documentation
│   ├── QUICKSTART.md              ← Fast installation guide
│   ├── FEATURES.md                ← Feature documentation
│   ├── ARCHITECTURE.md            ← System architecture
│   ├── PROJECT_SUMMARY.md         ← Project overview
│   ├── API.md                     ← Socket.io API reference
│   ├── CONFIGURATION.md           ← Config guide
│   ├── TESTING.md                 ← Testing procedures
│   └── COMPLETION.md              ← Project status
│
├── 🔧 Configuration Files
│   ├── package.json               ← Server dependencies
│   ├── .gitignore                 ← Git ignore rules
│   │
│   ├── setup.bat                  ← Auto-install script
│   ├── start-server.bat           ← Start backend
│   └── start-client.bat           ← Start frontend
│
├── 🖥️ Backend (server/)
│   ├── index.js                   ← Express + Socket.io server
│   ├── socket.js                  ← Socket event handlers
│   └── store.js                   ← In-memory data store
│
├── 🎨 Frontend (client/)
│   ├── package.json               ← Client dependencies
│   ├── .gitignore                 ← Client git ignore
│   │
│   ├── public/
│   │   └── index.html             ← HTML template
│   │
│   └── src/
│       ├── index.js               ← React entry point
│       ├── index.css              ← Global CSS reset
│       ├── App.js                 ← Main App component
│       ├── App.css                ← App styles
│       ├── HomePage.js            ← Landing page
│       │
│       ├── features/
│       │   │
│       │   ├── teacher/
│       │   │   ├── TeacherDashboard.jsx
│       │   │   ├── CreatePoll.jsx
│       │   │   └── teacher.css
│       │   │
│       │   ├── student/
│       │   │   ├── StudentJoin.jsx
│       │   │   ├── PollRoom.jsx
│       │   │   └── student.css
│       │   │
│       │   ├── poll/
│       │   │   ├── PollCard.jsx
│       │   │   ├── PollResults.jsx
│       │   │   ├── Timer.jsx
│       │   │   └── poll.css
│       │   │
│       │   └── chat/
│       │       ├── ChatPopup.jsx
│       │       └── chat.css
│       │
│       ├── store/
│       │   ├── store.js           ← Redux store config
│       │   ├── pollSlice.js       ← Poll state slice
│       │   └── studentSlice.js    ← Student state slice
│       │
│       ├── socket/
│       │   └── socket.js          ← Socket.io client
│       │
│       └── theme/
│           └── colors.js          ← Color palette
│
└── 🖼️ Design References (designimages/)
    └── (design images for reference)
```

---

## File Count Summary

### Documentation: 10 files
- INDEX.md
- README.md
- QUICKSTART.md
- FEATURES.md
- ARCHITECTURE.md
- PROJECT_SUMMARY.md
- API.md
- CONFIGURATION.md
- TESTING.md
- COMPLETION.md

### Backend: 4 files
- package.json
- server/index.js
- server/socket.js
- server/store.js

### Frontend: 25 files
**Configuration:**
- package.json
- public/index.html

**Core:**
- src/index.js
- src/index.css
- src/App.js
- src/App.css
- src/HomePage.js

**Features - Teacher (3):**
- TeacherDashboard.jsx
- CreatePoll.jsx
- teacher.css

**Features - Student (3):**
- StudentJoin.jsx
- PollRoom.jsx
- student.css

**Features - Poll (4):**
- PollCard.jsx
- PollResults.jsx
- Timer.jsx
- poll.css

**Features - Chat (2):**
- ChatPopup.jsx
- chat.css

**Store (3):**
- store.js
- pollSlice.js
- studentSlice.js

**Utilities (2):**
- socket/socket.js
- theme/colors.js

### Utilities: 3 files
- setup.bat
- start-server.bat
- start-client.bat

### Other: 2 files
- .gitignore (root)
- client/.gitignore

---

## Total Files: 44+

---

## Code Organization by Feature

### 🎓 Teacher Features
**Files:**
- features/teacher/TeacherDashboard.jsx (200 lines)
- features/teacher/CreatePoll.jsx (150 lines)
- features/teacher/teacher.css (250 lines)

**Responsibilities:**
- Poll creation interface
- Live results display
- Student management
- Dashboard layout

---

### 👨‍🎓 Student Features
**Files:**
- features/student/StudentJoin.jsx (80 lines)
- features/student/PollRoom.jsx (180 lines)
- features/student/student.css (200 lines)

**Responsibilities:**
- Join interface
- Poll participation
- Results viewing
- Connection status

---

### 📊 Poll Features
**Files:**
- features/poll/PollCard.jsx (80 lines)
- features/poll/PollResults.jsx (70 lines)
- features/poll/Timer.jsx (90 lines)
- features/poll/poll.css (250 lines)

**Responsibilities:**
- Poll display
- Option selection
- Results visualization
- Timer countdown

---

### 💬 Chat Features (BONUS)
**Files:**
- features/chat/ChatPopup.jsx (120 lines)
- features/chat/chat.css (200 lines)

**Responsibilities:**
- Real-time messaging
- Message display
- Chat interface

---

### 🏗️ State Management
**Files:**
- store/store.js (30 lines)
- store/pollSlice.js (120 lines)
- store/studentSlice.js (80 lines)

**Responsibilities:**
- Redux configuration
- Poll state management
- Student state management
- Action creators
- Reducers

---

### 🔌 Backend Services
**Files:**
- server/index.js (50 lines)
- server/socket.js (180 lines)
- server/store.js (200 lines)

**Responsibilities:**
- Express server setup
- Socket.io handlers
- In-memory data storage
- Event broadcasting
- Validation logic

---

## Code Size Breakdown

```
Category                Lines     Percentage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend Code            430       20%
Frontend JS             900       41%
CSS Styling            900       41%
Configuration           70        3%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Code             2200      100%

Documentation          3500+     (separate)
Comments               ~400      (inline)
```

---

## Technology Distribution

```
React Components        11
Redux Slices            2
Socket Events          14
CSS Files              5
Backend Modules        3
Utility Scripts        3
Documentation Files    10
```

---

## Dependencies Map

### Backend Dependencies
```
express@4.18.2
  └─ HTTP server framework

socket.io@4.18.2
  └─ Real-time WebSocket

cors@2.8.5
  └─ Cross-origin support

nodemon@3.0.1 (dev)
  └─ Auto-restart on changes
```

### Frontend Dependencies
```
react@18.2.0
  └─ UI library

react-dom@18.2.0
  └─ DOM rendering

react-router-dom@6.14.2
  └─ Client-side routing

@reduxjs/toolkit@1.9.5
  └─ State management

react-redux@8.1.1
  └─ Redux React bindings

socket.io-client@4.6.1
  └─ WebSocket client

react-scripts@5.0.1
  └─ Build tooling
```

---

## File Purpose Quick Reference

| File | Purpose | Size |
|------|---------|------|
| `server/index.js` | Server entry point | 50 lines |
| `server/socket.js` | Socket handlers | 180 lines |
| `server/store.js` | Data storage | 200 lines |
| `client/src/App.js` | Main component | 60 lines |
| `TeacherDashboard.jsx` | Teacher UI | 200 lines |
| `PollRoom.jsx` | Student UI | 180 lines |
| `pollSlice.js` | Poll state | 120 lines |
| `socket.js` (client) | Socket client | 20 lines |
| `colors.js` | Color theme | 15 lines |

---

## Import/Export Relationships

```
App.js
  ├─ imports TeacherDashboard
  ├─ imports StudentJoin
  ├─ imports PollRoom
  ├─ imports ChatPopup
  └─ imports HomePage

TeacherDashboard
  ├─ imports CreatePoll
  ├─ imports PollResults
  ├─ imports socket
  ├─ imports Redux hooks
  └─ imports Redux actions

PollRoom
  ├─ imports PollCard
  ├─ imports PollResults
  ├─ imports Timer
  ├─ imports socket
  └─ imports Redux

store/store.js
  ├─ imports pollSlice
  ├─ imports studentSlice
  └─ exports store

server/index.js
  ├─ imports socket.js
  └─ starts server

server/socket.js
  ├─ imports store.js
  └─ exports initializeSocket
```

---

## Color Usage Across Files

All CSS files use the standardized palette from `colors.js`:

```javascript
#7765DA  // Used in: buttons, gradients, headers
#5767D0  // Used in: backgrounds, hover states
#4F0DCE  // Used in: accents, active states
#F2F2F2  // Used in: backgrounds, borders
#373737  // Used in: text, headings
#6E6E6E  // Used in: secondary text
```

**Files using colors:**
- App.css
- teacher.css
- student.css
- poll.css
- chat.css

---

## Route Structure

```
/
├─ HomePage
│   ├─ "Enter as Teacher" → /teacher
│   └─ "Enter as Student" → /student
│
├─ /teacher
│   └─ TeacherDashboard
│       ├─ CreatePoll
│       ├─ PollResults
│       ├─ StudentsList
│       └─ ChatPopup
│
└─ /student
    └─ Conditional:
        ├─ No name → StudentJoin
        └─ Has name → PollRoom
            ├─ PollCard
            ├─ Timer
            ├─ PollResults
            └─ ChatPopup
```

---

## Data Flow Map

```
User Action
    ↓
React Component
    ↓
Redux Action (optional)
    ↓
Socket Emit
    ↓
Server Handler
    ↓
Server Store Update
    ↓
Socket Broadcast
    ↓
Client Socket Listener
    ↓
Redux Dispatch
    ↓
Redux Store Update
    ↓
Component Re-render
    ↓
UI Update
```

---

## Development Workflow Map

```
1. Edit Code
   ├─ Backend: server/*.js
   └─ Frontend: client/src/**/*.jsx

2. Auto Reload
   ├─ Backend: nodemon restarts
   └─ Frontend: React hot reload

3. Test in Browser
   └─ http://localhost:3000

4. Check Console
   ├─ Browser console (F12)
   └─ Server terminal

5. Fix Issues
   └─ Repeat from step 1
```

---

## Build & Deploy Map

```
Development
    ↓
npm install (both)
    ↓
npm start (both)
    ↓
Test locally
    ↓
Ready to deploy?
    ↓
    ├─ Frontend
    │   ├─ cd client
    │   ├─ npm run build
    │   └─ Deploy build/ to Vercel/Netlify
    │
    └─ Backend
        ├─ Set environment variables
        ├─ Update CORS origin
        └─ Deploy to Heroku/Railway
```

---

## Quick Navigation

**Want to:**
- Understand architecture? → [ARCHITECTURE.md](ARCHITECTURE.md)
- See all features? → [FEATURES.md](FEATURES.md)
- Install quickly? → [QUICKSTART.md](QUICKSTART.md)
- Configure settings? → [CONFIGURATION.md](CONFIGURATION.md)
- Learn the API? → [API.md](API.md)
- Run tests? → [TESTING.md](TESTING.md)
- Check completion? → [COMPLETION.md](COMPLETION.md)
- Find a file? → You're in the right place!

---

**This map is your guide to navigating the entire project!**

Use this alongside [INDEX.md](INDEX.md) for complete project orientation.
