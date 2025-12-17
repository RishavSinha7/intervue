/**
 * Timer Component
 * Displays countdown timer for active polls
 */

import React, { useEffect, useState } from 'react';
import './poll.css';

function Timer({ duration, startTime, timeRemaining }) {
  const [displayTime, setDisplayTime] = useState(timeRemaining || duration);

  useEffect(() => {
    if (timeRemaining !== undefined && !isNaN(timeRemaining)) {
      setDisplayTime(timeRemaining);
    }
  }, [timeRemaining]);

  const formatTime = (ms) => {
    // Handle invalid values
    if (!ms || isNaN(ms) || ms < 0) {
      return '00:00';
    }
    
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (!displayTime || isNaN(displayTime) || !duration || isNaN(duration)) {
      return 'timer-normal';
    }
    
    const percentage = (displayTime / duration) * 100;
    if (percentage <= 25) return 'timer-critical';
    if (percentage <= 50) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <div className={`timer-compact ${getTimerClass()}`}>
      {formatTime(displayTime)}
    </div>
  );
}

export default Timer;
