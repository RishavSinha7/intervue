/**
 * PollCard Component
 * Displays poll question and options for students to select and submit
 */

import React, { useState } from 'react';
import Timer from './Timer';
import './poll.css';

function PollCard({ poll, onSubmit, disabled, timeRemaining, duration, startTime }) {
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
      <div className="poll-header-with-timer">
        <h3 className="poll-question-number">Question 1</h3>
        <Timer 
          duration={duration} 
          startTime={startTime}
          timeRemaining={timeRemaining}
        />
      </div>
      
      <div className="poll-question-box">
        <h2 className="poll-question">{poll.question}</h2>
      </div>

      <div className="poll-card-content">
        
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
