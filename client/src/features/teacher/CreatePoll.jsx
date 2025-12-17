/**
 * CreatePoll Component
 * Allows teacher to create a new poll with question, options, time limit, and correct answer
 * UPDATED: Now supports marking one option as correct
 */

import React, { useState } from 'react';
import './teacher.css';

function CreatePoll({ onCreatePoll, canCreate }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0); // NEW: Track correct answer
  const [duration, setDuration] = useState(60);
  const [showForm, setShowForm] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      // Adjust correct option index if needed
      if (correctOptionIndex >= options.length - 1) {
        setCorrectOptionIndex(0);
      } else if (correctOptionIndex === index) {
        setCorrectOptionIndex(0);
      } else if (index < correctOptionIndex) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    // First, check if the correct option itself is empty
    if (!options[correctOptionIndex] || !options[correctOptionIndex].trim()) {
      alert('The option marked as correct cannot be empty. Please enter text for it or select a different correct option.');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    if (duration < 10 || duration > 300) {
      alert('Duration must be between 10 and 300 seconds');
      return;
    }

    // CRITICAL FIX: Recalculate correctOptionIndex after filtering empty options
    // Count how many empty options exist before the correct option
    const emptyOptionsBefore = options.slice(0, correctOptionIndex).filter(opt => !opt.trim()).length;
    const adjustedCorrectIndex = correctOptionIndex - emptyOptionsBefore;

    // Create poll with correct answer
    const pollData = {
      question: question.trim(),
      options: validOptions,
      duration,
      correctOptionIndex: adjustedCorrectIndex // Adjusted index after filtering
    };
    console.log('CreatePoll - Sending poll data:', pollData);
    console.log('Original correctOptionIndex:', correctOptionIndex, '→ Adjusted:', adjustedCorrectIndex);
    onCreatePoll(pollData);

    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setCorrectOptionIndex(0);
    setDuration(60);
    setShowForm(false);
  };

  const handleCancel = () => {
    setQuestion('');
    setOptions(['', '']);
    setCorrectOptionIndex(0);
    setDuration(60);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="create-poll-container">
        <button
          className="btn-primary btn-create-poll"
          onClick={() => setShowForm(true)}
          disabled={!canCreate}
          style={{ width: '100%', maxWidth: 'none' }}
        >
          + Create New Poll
        </button>
        {!canCreate && (
          <p className="warning-text">
            Wait for all students to answer the current poll before creating a new one
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="create-poll-form" style={{ padding: '16px' }}>
      <div className="form-header" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Create New Poll</h2>
        <p className="form-subtitle" style={{ fontSize: '13px', color: '#666' }}>
          Create polls and monitor your students' responses in real-time.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Question Input */}
        <div className="form-group">
          <label className="form-label">Enter your question</label>
          <div className="input-with-counter">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="input-textarea"
              maxLength={100}
              rows={2}
              style={{ fontSize: '14px', padding: '8px 12px' }}
            />
            <span className="char-counter">{question.length}/100</span>
          </div>
        </div>

        {/* Options Section with Duration Selector on same line */}
        <div className="form-group" style={{ marginBottom: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontSize: '14px', margin: 0 }}>Edit Options</label>
            <label className="form-label-inline" style={{ margin: 0 }}>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="select-duration"
                style={{ fontSize: '14px', padding: '6px 30px 6px 10px' }}
              >
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
              <span className="dropdown-icon">▼</span>
            </label>
          </div>
          <div className="options-header" style={{ fontSize: '12px', marginBottom: '8px' }}>
            <span className="options-label-left">Option</span>
            <span className="options-label-right">Is it Correct?</span>
          </div>

          {options.map((option, index) => (
            <div key={index} className="option-row-with-correct" style={{ marginBottom: '8px' }}>
              <div className="option-number-circle" style={{ width: '24px', height: '24px', fontSize: '12px', lineHeight: '24px' }}>{index + 1}</div>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder="Enter options here"
                className="input-option"
                maxLength={100}
                style={{ fontSize: '14px', padding: '6px 10px' }}
              />
              <div className="correct-answer-selector" style={{ gap: '8px' }}>
                <label className="radio-label" style={{ fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctOptionIndex === index}
                    onChange={() => setCorrectOptionIndex(index)}
                  />
                  <span className="radio-text">Yes</span>
                </label>
                <label className="radio-label" style={{ fontSize: '13px' }}>
                  <input
                    type="radio"
                    name={`incorrect-${index}`}
                    checked={correctOptionIndex !== index}
                    onChange={() => {}}
                    disabled
                  />
                  <span className="radio-text">No</span>
                </label>
              </div>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="btn-remove-option"
                  title="Remove option"
                  style={{ fontSize: '16px', width: '24px', height: '24px' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="btn-add-more-option"
              style={{ fontSize: '13px', padding: '6px 12px', width: 'fit-content', marginTop: '0', marginLeft: '40px' }}
            >
              + Add More option
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="form-actions-bottom" style={{ marginTop: '16px', gap: '10px' }}>
          <button type="button" onClick={handleCancel} className="btn-cancel" style={{ fontSize: '14px', padding: '8px 16px' }}>
            Cancel
          </button>
          <button type="submit" className="btn-ask-question" style={{ fontSize: '14px', padding: '8px 16px' }}>
            + Ask a new question
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePoll;
