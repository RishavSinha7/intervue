/**
 * StudentJoin Component
 * Entry screen for students to enter their name and join the polling session
 */

import React, { useState } from 'react';
import './student.css';

function StudentJoin({ onJoin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    onJoin(trimmedName);
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
              autoFocus
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
