/**
 * TeacherDashboard Component
 * Main interface for teachers to create polls, view results, and manage students
 * MULTI-ROOM SUPPORT: Room ID from URL query parameter
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../socket/socket';
import CreatePoll from './CreatePoll';
import PollResults from '../poll/PollResults';
import PollHistory from '../poll/PollHistory';
import Timer from '../poll/Timer';
import {
  setPollResults,
  setStudents,
  setPollEnded,
  setPastPolls,
  setError
} from '../../store/pollSlice';
import { setTeacherMode, setConnected, addMessage } from '../../store/studentSlice';
import './teacher.css';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { pollResults, students, isPollActive } = useSelector(state => state.poll);
  const [canCreatePoll, setCanCreatePoll] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [showPollEnded, setShowPollEnded] = useState(false);

  // Extract or generate room ID from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let room = urlParams.get('room');
    
    // If no room in URL, generate a short, easy-to-type room code
    if (!room) {
      // Generate 6-character room code (e.g., ABC123)
      const randomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      room = randomCode;
      window.history.replaceState({}, '', `?room=${room}`);
    }
    
    setRoomId(room);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    // Connect as teacher with room ID (no name needed)
    socket.connect();
    socket.emit('join_as_teacher', { roomId });
    dispatch(setTeacherMode(true));
    dispatch(setConnected(true));

    // Listen for teacher joined confirmation
    socket.on('teacher_joined', (data) => {
      console.log('Teacher joined successfully', data);
      setIsJoined(true);
      if (data.students) {
        dispatch(setStudents(data.students));
      }
      if (data.currentPoll) {
        dispatch(setPollResults(data.currentPoll));
      }
      if (data.pastPolls) {
        dispatch(setPastPolls(data.pastPolls));
      }
    });

    // Listen for poll created
    socket.on('poll_created', (results) => {
      dispatch(setPollResults(results));
      setCanCreatePoll(false);
      setShowPollEnded(false);
    });

    // Listen for live results updates
    socket.on('live_results', (results) => {
      dispatch(setPollResults(results));
    });

    // Listen for poll ended
    socket.on('poll_ended', (results) => {
      dispatch(setPollEnded(results));
      setCanCreatePoll(true);
      setShowPollEnded(true);
    });

    // Listen for student joined
    socket.on('student_joined', (data) => {
      dispatch(setStudents(data.students));
    });

    // Listen for student left
    socket.on('student_left', (data) => {
      dispatch(setStudents(data.students));
    });

    // Listen for student removed
    socket.on('student_removed', (data) => {
      dispatch(setStudents(data.students));
    });

    // Listen for poll errors
    socket.on('poll_error', (data) => {
      dispatch(setError(data.message));
      alert(data.message);
    });

    // Listen for chat messages
    socket.on('new_message', (data) => {
      dispatch(addMessage(data));
    });

    // Cleanup
    return () => {
      socket.off('teacher_joined');
      socket.off('poll_created');
      socket.off('live_results');
      socket.off('poll_ended');
      socket.off('student_joined');
      socket.off('student_left');
      socket.off('student_removed');
      socket.off('poll_error');
      socket.off('new_message');
    };
  }, [dispatch, roomId]);

  // Check if can create poll based on students answered
  useEffect(() => {
    if (pollResults && students.length > 0) {
      const allAnswered = students.every(s => s.hasAnswered);
      setCanCreatePoll(!isPollActive || allAnswered);
    }
  }, [pollResults, students, isPollActive]);

  const handleCreatePoll = (pollData) => {
    socket.emit('create_poll', pollData);
  };

  const handleRemoveStudent = (socketId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      socket.emit('remove_student', socketId);
    }
  };

  // Show loading until room is joined
  if (!isJoined || !roomId) {
    return (
      <div className="teacher-dashboard">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <p>Connecting to room: {roomId}...</p>
        </div>
      </div>
    );
  }

  // Generate shareable student link
  const studentLink = `${window.location.origin}/?room=${roomId}`;

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="room-info" style={{ 
          margin: '10px 0', 
          padding: '10px 14px', 
          background: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Room Code</span>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#667eea',
                letterSpacing: '1.5px',
                marginTop: '2px'
              }}>{roomId}</div>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                alert('Room code copied!');
              }}
              style={{ 
                padding: '5px 12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Copy
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '450px' }}>
            <input 
              type="text" 
              value={studentLink} 
              readOnly 
              onClick={(e) => e.target.select()}
              style={{ 
                flex: 1,
                padding: '5px 8px', 
                fontFamily: 'monospace',
                fontSize: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                color: '#666'
              }}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(studentLink);
                alert('Link copied!');
              }}
              style={{ 
                padding: '5px 12px',
                background: 'white',
                color: '#667eea',
                border: '1px solid #667eea',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Copy Link
            </button>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-view-history"
            onClick={() => setShowHistory(true)}
            title="View poll history"
          >
            View Poll History
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="left-panel">
            <CreatePoll onCreatePoll={handleCreatePoll} canCreate={canCreatePoll} />
          </div>
          
          {pollResults && (
            <div className="right-panel">
              <div className="results-section">
                <h2 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600', color: '#373737' }}>
                  {isPollActive ? 'Live Poll Results' : 'Final Poll Results'}
                </h2>
                {isPollActive && pollResults.duration && (
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <Timer 
                      duration={pollResults.duration} 
                      startTime={pollResults.startTime}
                      timeRemaining={pollResults.timeRemaining}
                    />
                  </div>
                )}
                {showPollEnded && (
                  <div style={{ 
                    marginBottom: '16px', 
                    padding: '10px 16px', 
                    background: '#FEF3C7', 
                    border: '1px solid #FCD34D',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#92400E'
                  }}>
                    ⏱️ Poll Ended
                  </div>
                )}
                <PollResults results={pollResults} isTeacher={true} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Poll History Modal */}
      {showHistory && (
        <PollHistory onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default TeacherDashboard;
