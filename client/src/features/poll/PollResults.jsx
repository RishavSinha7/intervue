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
            <div key={index} className="result-item-row" style={{ marginBottom: '8px' }}>
              <div className="result-number-circle" style={{ 
                width: '32px', 
                height: '32px', 
                fontSize: '14px',
                lineHeight: '32px'
              }}>
                {index + 1}
              </div>
              <div className="result-bar-wrapper" style={{ flex: 1 }}>
                <div className="result-bar-fill" style={{ width: `${percentage}%` }}>
                  <span className="result-option-text">{option}</span>
                </div>
              </div>
              <span className="result-percentage">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PollResults;
