/**
 * PollRoom Component
 * Main interface for students to view and answer polls
 * MULTI-ROOM SUPPORT: Uses room ID from props
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../socket/socket';
import PollCard from '../poll/PollCard';
import PollResults from '../poll/PollResults';
import Timer from '../poll/Timer';
import {
  setPollStarted,
  setAnswerSubmitted,
  setPollEnded,
  setTimeRemaining
} from '../../store/pollSlice';
import { setSocketId, setConnected, disconnect, addMessage, setKicked } from '../../store/studentSlice';
import './student.css';

function PollRoom({ studentName, roomId }) {
  const dispatch = useDispatch();
  const { 
    currentPoll, 
    hasAnswered, 
    pollResults, 
    isPollActive,
    timeRemaining,
    answerFeedback
  } = useSelector(state => state.poll);
  const { socketId, kicked } = useSelector(state => state.student);

  useEffect(() => {
    // Connect and join as student with room ID
    socket.connect();
    socket.emit('join_as_student', { 
      name: studentName,
      roomId: roomId
    });
    dispatch(setConnected(true));

    // Listen for join success
    socket.on('join_success', (data) => {
      console.log('Joined successfully', data);
      dispatch(setSocketId(data.socketId));
    });

    // Listen for poll started
    socket.on('poll_started', (poll) => {
      console.log('Poll started', poll);
      dispatch(setPollStarted(poll));
    });

    // Listen for answer submitted confirmation
    socket.on('answer_submitted', (data) => {
      dispatch(setAnswerSubmitted(data));
    });

    // Listen for poll ended
    socket.on('poll_ended', (results) => {
      console.log('Poll ended', results);
      dispatch(setPollEnded(results));
    });

    // Listen for answer errors
    socket.on('answer_error', (data) => {
      alert(data.message);
    });

    // Listen for being kicked
    socket.on('kicked', (data) => {
      alert(data.message);
      dispatch(setKicked(true));
      dispatch(disconnect());
      socket.disconnect();
    });

    // Listen for chat messages
    socket.on('new_message', (data) => {
      dispatch(addMessage(data));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (!kicked) {
        alert('Connection lost. Please refresh the page.');
      }
      dispatch(disconnect());
    });

    // Cleanup
    return () => {
      socket.off('join_success');
      socket.off('poll_started');
      socket.off('answer_submitted');
      socket.off('poll_ended');
      socket.off('answer_error');
      socket.off('kicked');
      socket.off('new_message');
      socket.off('disconnect');
    };
  }, [dispatch, studentName, kicked]);

  // Timer countdown effect
  useEffect(() => {
    if (isPollActive && currentPoll && !hasAnswered) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - currentPoll.startTime;
        const remaining = Math.max(0, currentPoll.duration - elapsed);
        
        dispatch(setTimeRemaining(remaining));

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPollActive, currentPoll, hasAnswered, dispatch]);

  const handleSubmitAnswer = (optionIndex) => {
    socket.emit('submit_answer', optionIndex);
  };

  if (kicked) {
    return (
      <div className="student-room">
        <div className="kicked-message">
          <h2>You have been removed from the session</h2>
          <p>Please contact your teacher for assistance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-room">
      <div className="room-header">
        <div className="student-info-header">
          <h2>Welcome, {studentName}!</h2>
        </div>
      </div>

      <div className="room-content">
        {!currentPoll && !pollResults && (
          <div className="waiting-message">
            <div className="intervue-badge">
              <span className="star-icon">✦</span> Intervue Poll
            </div>
            <h3>Waiting for the teacher to ask a question</h3>
            <p>The teacher will start a poll soon</p>
          </div>
        )}

        {isPollActive && currentPoll && !hasAnswered && (
          <div className="poll-section">
            <PollCard
              poll={currentPoll}
              onSubmit={handleSubmitAnswer}
              disabled={timeRemaining === 0}
              timeRemaining={timeRemaining}
              duration={currentPoll.duration}
              startTime={currentPoll.startTime}
            />
          </div>
        )}

        {hasAnswered && (
          <div className="results-section">
            {/* ANTI-CHEAT: Show feedback ONLY after poll ends */}
            {!isPollActive && answerFeedback && (
              <div className={`answer-feedback ${answerFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="feedback-icon">
                  {answerFeedback.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
                <span className="feedback-text">
                  {answerFeedback.isCorrect ? 'Correct answer!' : 'Wrong answer'}
                </span>
                {!answerFeedback.isCorrect && answerFeedback.correctOptionIndex !== undefined && pollResults && pollResults.options && (
                  <span className="correct-answer-hint">
                    The correct answer was: {pollResults.options[answerFeedback.correctOptionIndex]}
                  </span>
                )}
              </div>
            )}
            
            {isPollActive ? (
              <div className="waiting-results">
                <div className="submitted-confirmation">
                  <span>Answer submitted!</span>
                </div>
                <p>Please wait for the poll to end...</p>
              </div>
            ) : (
              pollResults && <PollResults results={pollResults} isTeacher={false} />
            )}
          </div>
        )}

        {!isPollActive && pollResults && !hasAnswered && (
          <div className="poll-ended-section">
            <div className="answer-feedback incorrect">
              <span className="feedback-text">Time's up! You didn't answer</span>
              {pollResults.correctOptionIndex !== undefined && pollResults.options && (
                <span className="correct-answer-hint">
                  The correct answer was: {pollResults.options[pollResults.correctOptionIndex]}
                </span>
              )}
            </div>
            <p className="poll-ended-message">This poll has ended</p>
            <PollResults results={pollResults} isTeacher={false} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PollRoom;
