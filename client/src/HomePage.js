/**
 * HomePage Component
 * Landing page with options to join as teacher or student
 * MULTI-ROOM SUPPORT: Auto-redirect to student if room ID in URL
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');

  // Auto-redirect to student page if room ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    
    if (room) {
      // If there's a room ID in URL, assume student role and redirect
      navigate('/student' + window.location.search);
    }
  }, [navigate]);

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student');
    } else {
      navigate('/teacher');
    }
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="intervue-badge">
          <span className="star-icon">✦</span> Intervue Poll
        </div>
        
        <div className="homepage-header">
          <h1>Welcome to the <span className="highlight">Live Polling System</span></h1>
          <p>Please select the role that best describes you to begin using the live polling system</p>
        </div>

        <div className="role-selection">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('student')}
          >
            <h2>I'm a Student</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('teacher')}
          >
            <h2>I'm a Teacher</h2>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <div className="continue-button-wrapper">
          <button className="btn-continue" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
