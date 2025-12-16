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
  // IDENTITY FIX: Student name is NOT persisted in localStorage
  // Each browser tab/refresh creates a NEW student session
  // Identity is socket-based ONLY (server-side by socket.id)
  const [studentName, setStudentName] = useState('');

  const handleStudentJoin = (name) => {
    setStudentName(name);
    // NO localStorage - each tab must enter name separately
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
            studentName ? (
              <PollRoom studentName={studentName} />
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
