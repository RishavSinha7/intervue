/**
 * PollResults Component
 * Displays poll results with vote counts and percentages
 */

import React from 'react';
import './poll.css';

function PollResults({ results, isTeacher }) {
  if (!results) {
    return <div className="no-results">No results available</div>;
  }

  const { question, options, results: voteCounts, totalVotes, correctOptionIndex } = results;

  return (
    <div className="poll-results" style={{ padding: '16px' }}>
      <h3 className="results-question" style={{ fontSize: '18px', marginBottom: '8px' }}>{question}</h3>
      
      <div className="results-stats" style={{ fontSize: '13px', marginBottom: '12px', color: '#666' }}>
        <span>Total Votes: {totalVotes}</span>
      </div>

      <div className="results-list" style={{ gap: '10px' }}>
        {options.map((option, index) => {
          const votes = voteCounts[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isCorrectOption = correctOptionIndex !== undefined && index === correctOptionIndex;

          return (
            <div key={index} className={`result-item ${isCorrectOption ? 'correct-option' : ''}`} style={{ marginBottom: '8px' }}>
              <div className="result-header" style={{ marginBottom: '4px' }}>
                <span className="result-option" style={{ fontSize: '14px', gap: '8px' }}>
                  {option}
                  {isCorrectOption && <span className="correct-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>Correct Answer</span>}
                </span>
                <span className="result-votes" style={{ fontSize: '13px' }}>{votes} votes ({percentage}%)</span>
              </div>
              <div className="result-bar-container" style={{ height: '20px' }}>
                <div
                  className={`result-bar ${isCorrectOption ? 'correct-bar' : ''}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PollResults;
