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
    <div className="poll-results">
      <h3 className="results-question">{question}</h3>
      
      <div className="results-stats">
        <span>Total Votes: {totalVotes}</span>
      </div>

      <div className="results-list">
        {options.map((option, index) => {
          const votes = voteCounts[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isCorrectOption = correctOptionIndex !== undefined && index === correctOptionIndex;

          return (
            <div key={index} className={`result-item ${isCorrectOption ? 'correct-option' : ''}`}>
              <div className="result-header">
                <span className="result-option">
                  {option}
                  {isCorrectOption && <span className="correct-badge">✓ Correct</span>}
                </span>
                <span className="result-votes">{votes} votes ({percentage}%)</span>
              </div>
              <div className="result-bar-container">
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
