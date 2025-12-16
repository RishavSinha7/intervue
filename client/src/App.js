/**
 * App Component
 * Main application component with routing
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import StudentJoin from './features/student/StudentJoin';
import PollRoom from './features/student/PollRoom';
import ChatPopup from './features/chat/ChatPopup';
import HomePage from './HomePage';
import './App.css';

function AppContent() {
  const location = useLocation();
  // MULTI-ROOM SUPPORT: Store both student name and room ID
  const [studentName, setStudentName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleStudentJoin = (name, room) => {
    setStudentName(name);
    setRoomId(room);
  };

  // Show chat only on teacher and student pages
  const showChat = location.pathname === '/teacher' || 
                   (location.pathname === '/student' && studentName);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route
          path="/student"
          element={
            studentName && roomId ? (
              <PollRoom studentName={studentName} roomId={roomId} />
            ) : (
              <StudentJoin onJoin={handleStudentJoin} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Show chat popup on teacher and student pages */}
      {showChat && <ChatPopup />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
