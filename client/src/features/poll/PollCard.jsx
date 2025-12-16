/**
 * PollCard Component
 * Displays poll question and options for students to select and submit
 */

import React, { useState } from 'react';
import './poll.css';

function PollCard({ poll, onSubmit, disabled }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSubmit = () => {
    if (selectedOption === null) {
      alert('Please select an option');
      return;
    }

    onSubmit(selectedOption);
  };

  return (
    <div className="poll-card">
      <div className="poll-card-header">
        <h3 className="poll-card-title">Question 1</h3>
      </div>

      <div className="poll-card-content">
        <h2 className="poll-question">{poll.question}</h2>
        
        <div className="poll-options">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className={`poll-option ${selectedOption === index ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && setSelectedOption(index)}
            >
              <div className="option-radio">
                {selectedOption === index && <div className="radio-dot"></div>}
              </div>
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>

        <div className="poll-card-footer">
          <button
            className="btn-primary btn-submit"
            onClick={handleSubmit}
            disabled={disabled || selectedOption === null}
          >
            {disabled ? 'Time Expired' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PollCard;
