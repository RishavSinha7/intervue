# Quick Start Guide

## Installation

### Option 1: Automated Setup (Windows)
Simply double-click `setup.bat` to install all dependencies automatically.

### Option 2: Manual Setup
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

## Running the Application

### Option A: Using Batch Files (Windows)
1. Double-click `start-server.bat` to start the backend
2. Double-click `start-client.bat` to start the frontend (in a new window)

### Option B: Manual Start
**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Testing the Application

1. **Open your browser** to `http://localhost:3000`

2. **Open as Teacher:**
   - Click "Enter as Teacher"
   - Create a poll with question and options
   - Set time limit (default: 60 seconds)

3. **Open as Student (in another tab/window):**
   - Click "Enter as Student"
   - Enter your name
   - Wait for teacher to create a poll
   - Submit your answer

4. **Test Multiple Students:**
   - Open more browser tabs
   - Join as different students
   - Observe real-time updates

## Troubleshooting

**Port already in use:**
- Backend (4000): Change PORT in server/index.js
- Frontend (3000): Will prompt for alternative port

**Connection issues:**
- Ensure backend is running before starting frontend
- Check SOCKET_URL in client/src/socket/socket.js

**Dependencies not installing:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Run setup again

## Features to Test

✅ Teacher creates poll with time limit
✅ Students see poll immediately
✅ Live timer countdown
✅ Submit answer (only once per poll)
✅ View live results after answering
✅ Auto-end poll when timer expires
✅ Auto-end poll when all students answer
✅ Teacher can remove students
✅ New poll creation restrictions
✅ Real-time student connection status

## Default Ports

- Backend: http://localhost:4000
- Frontend: http://localhost:3000

## Support

For issues or questions, refer to the main README.md file.
