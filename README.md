# Live Polling System

A real-time polling application with Teacher and Student personas built using React, Redux, Node.js, Express, and Socket.io.

> 📚 **New to the project?** Check out [INDEX.md](INDEX.md) for a complete documentation guide!
> 🗺️ **Looking for files?** See [PROJECT_MAP.md](PROJECT_MAP.md) for the complete project structure!

## 🎯 Features

### Teacher Dashboard
- Create polls with multiple options and configurable time limits
- View live poll results in real-time
- Manage connected students
- Remove students from the session
- Automatically prevent new poll creation until all students answer

### Student Interface
- Join with unique name per browser tab
- Submit answers to active polls
- View live results after answering
- Auto-show results when timer expires
- Real-time updates

## 🛠️ Tech Stack

**Frontend:**
- React (JavaScript)
- Redux Toolkit for state management
- Socket.io-client for real-time communication
- React Router for navigation
- CSS Modules for styling

**Backend:**
- Node.js + Express.js
- Socket.io for WebSocket communication
- In-memory state (no database)

## 🎨 Design

Built with a modern color palette:
- #7765DA (Lavender)
- #5767D0 (Blue-Violet)
- #4F0DCE (Deep Violet)
- #F2F2F2 (Light Gray)
- #373737 (Dark Gray)
- #6E6E6E (Medium Gray)

## 📁 Project Structure

```
intervue/
├── server/
│   ├── index.js          # Main server file
│   ├── socket.js         # Socket.io event handlers
│   └── store.js          # In-memory data store
├── client/
│   ├── public/
│   └── src/
│       ├── features/
│       │   ├── teacher/  # Teacher components
│       │   ├── student/  # Student components
│       │   └── poll/     # Shared poll components
│       ├── store/        # Redux store and slices
│       ├── socket/       # Socket.io client
│       ├── theme/        # Color palette
│       ├── App.js
│       └── index.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intervue
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:4000`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the application**
   - Open `http://localhost:3000` in your browser
   - Choose Teacher or Student role
   - For testing, open multiple browser tabs

## 📋 Usage Guide

### As a Teacher:
1. Navigate to the homepage and select "Teacher"
2. Create a new poll with:
   - Question
   - 2-6 options
   - Time limit (10-300 seconds)
3. View live results as students submit answers
4. Manage connected students
5. Create a new poll after all students have answered

### As a Student:
1. Navigate to the homepage and select "Student"
2. Enter your name to join the session
3. Wait for the teacher to start a poll
4. Submit your answer before time expires
5. View results after submission or when poll ends

## 🔌 Socket.io Events

### Teacher Events:
- `join_as_teacher` - Join as teacher
- `create_poll` - Create a new poll
- `remove_student` - Remove a student

### Student Events:
- `join_as_student` - Join with name
- `submit_answer` - Submit poll answer

### Broadcast Events:
- `poll_started` - Poll has been created
- `poll_ended` - Poll has ended
- `live_results` - Real-time result updates
- `student_joined` - New student connected
- `student_left` - Student disconnected
- `answer_submitted` - Answer confirmation

## 🔒 Validation Rules

- **Teacher can create poll only if:**
  - No active poll exists, OR
  - All students have answered current poll

- **Students can answer only:**
  - Once per poll
  - Before timer expires

- **Name validation:**
  - Minimum 2 characters
  - Maximum 30 characters
  - Unique per browser tab

## 🎯 Key Implementation Details

- Server maintains single source of truth
- All state stored in-memory (resets on restart)
- Socket.id used as student identifier
- Real-time synchronization via Socket.io
- Redux for client-side state management
- Automatic poll cleanup and timer management

## 📝 Development Notes

- No TypeScript used (per requirements)
- No external UI libraries
- No database (in-memory only)
- Feature-based folder structure
- Functional components only
- Clean, commented code

## 🤝 Contributing

This is a demonstration project built to specific requirements.

## 📄 License

MIT

---

Built with ❤️ using React, Redux, and Socket.io
