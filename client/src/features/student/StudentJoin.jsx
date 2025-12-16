/**
 * StudentJoin Component
 * Entry screen for students to enter their name and join the polling session
 * MULTI-ROOM SUPPORT: Extracts room ID from URL OR allows manual entry
 */

import React, { useState, useEffect } from 'react';
import './student.css';

function StudentJoin({ onJoin }) {
  const [name, setName] = useState('');
  const [manualRoomId, setManualRoomId] = useState('');
  const [error, setError] = useState('');
  const [urlRoomId, setUrlRoomId] = useState(null);

  // Extract room ID from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    
    if (room) {
      setUrlRoomId(room);
      setManualRoomId(room); // Pre-fill the manual input
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use manual room ID (whether from URL or typed)
    const roomToJoin = manualRoomId.trim();
    
    if (!roomToJoin) {
      setError('Please enter a Room ID');
      return;
    }

    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 30) {
      setError('Name must be less than 30 characters');
      return;
    }

    // Pass both name and roomId to parent
    onJoin(trimmedName, roomToJoin);
  };

  return (
    <div className="student-join-container">
      <div className="join-card">
        <div className="intervue-badge">
          <span className="star-icon">✦</span> Intervue Poll
        </div>
        
        <div className="join-header">
          <h1>Let's Get Started</h1>
          <p>
            If you're a student, you'll be able to <span className="highlight">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="room-input" className="input-label">Room ID</label>
            <input
              id="room-input"
              type="text"
              value={manualRoomId}
              onChange={(e) => {
                setManualRoomId(e.target.value);
                setError('');
              }}
              placeholder="Enter Room ID provided by your teacher"
              className="input-field"
              style={{ 
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            />
            {urlRoomId && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '10px' }}>
                Room ID detected from link
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name-input" className="input-label">Enter your Name</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name to Join"
              className="input-field input-large"
              maxLength={30}
              autoFocus={!urlRoomId}
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <button type="submit" className="btn-continue">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentJoin;
