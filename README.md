# Live Polling System

A real-time polling application with Teacher and Student personas built using React, Redux, Node.js, Express, and Socket.io.

## Features

### Teacher Dashboard
- Create polls with multiple options and configurable time limits
- View live poll results in real-time
- Manage connected students
- Remove students from the session
- Multi-room support with unique room codes

### Student Interface
- Join with unique name per browser tab
- Submit answers to active polls
- View live results after answering
- Auto-show results when timer expires
- Real-time chat functionality

## Tech Stack

**Frontend:**
- React with Redux Toolkit
- Socket.io-client for real-time communication
- React Router for navigation

**Backend:**
- Node.js + Express.js
- Socket.io for WebSocket communication
- In-memory state management

## Project Structure

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
│       │   ├── poll/     # Poll components
│       │   └── chat/     # Chat components
│       ├── store/        # Redux store
│       ├── socket/       # Socket.io client
│       ├── App.js
│       └── index.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository and install dependencies
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   npm start
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```

3. **Access at** `http://localhost:3000`

## Usage Guide

### Teacher:
1. Select "Teacher" on homepage
2. Create room or join existing room with code
3. Create polls with questions, options, and time limits
4. View live results and manage students

### Student:
1. Select "Student" on homepage
2. Enter name and room code
3. Answer polls before time expires
4. View results and chat with other participants

Built with React, Redux, and Socket.io
