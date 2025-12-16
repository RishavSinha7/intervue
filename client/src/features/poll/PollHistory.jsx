/**
 * PollHistory Component
 * Displays past polls with results for teachers
 */

import React, { useState, useEffect } from 'react';
import socket from '../../socket/socket';
import './pollHistory.css';

function PollHistory({ onClose }) {
  const [pollHistory, setPollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request poll history from server
    socket.emit('get_poll_history');

    // Listen for poll history response
    const handlePollHistory = (history) => {
      setPollHistory(history);
      setLoading(false);
    };

    const handlePollHistoryError = (data) => {
      console.error('Poll history error:', data.message);
      setLoading(false);
    };

    socket.on('poll_history', handlePollHistory);
    socket.on('poll_history_error', handlePollHistoryError);

    // Cleanup
    return () => {
      socket.off('poll_history', handlePollHistory);
      socket.off('poll_history_error', handlePollHistoryError);
    };
  }, []);

  return (
    <div className="poll-history-overlay" onClick={onClose}>
      <div className="poll-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="poll-history-header">
          <h2>View Poll History</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="poll-history-content">
          {loading ? (
            <div className="loading-state">Loading poll history...</div>
          ) : pollHistory.length === 0 ? (
            <div className="empty-state">
              <p>No past polls yet</p>
              <p className="empty-subtitle">Poll history will appear here after you create and complete polls</p>
            </div>
          ) : (
            <div className="poll-history-list">
              {pollHistory.map((poll) => (
                <div key={poll.id} className="poll-history-card">
                  <div className="poll-history-card-header">
                    <h3>Question {poll.id}</h3>
                  </div>
                  
                  <div className="poll-question-box">
                    {poll.question}
                  </div>

                  <div className="poll-options-results">
                    {poll.options.map((option, index) => (
                      <div key={index} className="poll-option-result">
                        <div className="option-header">
                          <span className="option-label">
                            <span className="option-radio">⦿</span>
                            {option}
                          </span>
                          <span className="option-percentage">{poll.percentages[index]}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${poll.percentages[index]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="poll-meta-info">
                    <span className="meta-item">
                      Total Votes: <strong>{poll.totalVotes}</strong>
                    </span>
                    <span className="meta-item">
                      Completed: <strong>{poll.completionReason === 'TIME_EXPIRED' ? 'Time Expired' : 'All Answered'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PollHistory;
