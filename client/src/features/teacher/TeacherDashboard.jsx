/**
 * TeacherDashboard Component
 * Main interface for teachers to create polls, view results, and manage students
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../socket/socket';
import CreatePoll from './CreatePoll';
import PollResults from '../poll/PollResults';
import PollHistory from '../poll/PollHistory';
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

  useEffect(() => {
    // Connect as teacher
    socket.connect();
    socket.emit('join_as_teacher');
    dispatch(setTeacherMode(true));
    dispatch(setConnected(true));

    // Listen for teacher joined confirmation
    socket.on('teacher_joined', (data) => {
      console.log('Teacher joined successfully', data);
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
    });

    // Listen for live results updates
    socket.on('live_results', (results) => {
      dispatch(setPollResults(results));
    });

    // Listen for poll ended
    socket.on('poll_ended', (results) => {
      dispatch(setPollEnded(results));
      setCanCreatePoll(true);
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
  }, [dispatch]);

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

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-actions">
          <button 
            className="btn-view-history"
            onClick={() => setShowHistory(true)}
            title="View poll history"
          >
            <span className="history-icon">👁</span>
            View Poll History
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="full-width-panel">
          <CreatePoll onCreatePoll={handleCreatePoll} canCreate={canCreatePoll} />
          
          {pollResults && (
            <div className="results-section">
              <h2>Poll Results</h2>
              <PollResults results={pollResults} isTeacher={true} />
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
