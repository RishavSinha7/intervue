/**
 * Poll Slice - Redux state management for polling
 * Manages poll state, results, and real-time updates
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  pollResults: null,
  hasAnswered: false,
  userAnswer: null,
  isPollActive: false,
  timeRemaining: 0,
  students: [],
  pastPolls: [],
  answerFeedback: null,
  error: null
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    // Set current poll when poll starts
    setPollStarted: (state, action) => {
      state.currentPoll = action.payload;
      state.isPollActive = true;
      state.hasAnswered = false;
      state.userAnswer = null;
      state.pollResults = null;
      state.answerFeedback = null;
      state.timeRemaining = action.payload.duration;
      state.error = null;
    },

    // Update poll results (real-time)
    setPollResults: (state, action) => {
      state.pollResults = action.payload;
    },

    // ANTI-CHEAT: Mark that user has submitted answer
    // NO correctness feedback until poll ends
    setAnswerSubmitted: (state, action) => {
      state.hasAnswered = true;
      state.userAnswer = action.payload.optionIndex;
      // NO answerFeedback yet - prevents answer leakage
      // Feedback will be set when poll_ended is received
    },

    // ANTI-CHEAT: End poll and reveal correctness
    // All students see results at the same time
    setPollEnded: (state, action) => {
      state.isPollActive = false;
      state.pollResults = action.payload;

      // Now reveal correctness feedback (if student answered)
      if (action.payload.myAnswer) {
        state.answerFeedback = {
          isCorrect: action.payload.myAnswer.isCorrect,
          correctOptionIndex: action.payload.correctOptionIndex
        };
      } else if (!state.hasAnswered && action.payload.correctOptionIndex !== undefined) {
        // Student didn't answer - still show correct answer
        state.answerFeedback = {
          isCorrect: false,
          correctOptionIndex: action.payload.correctOptionIndex
        };
      }
    },

    // Update time remaining
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },

    // Update students list (for teacher)
    setStudents: (state, action) => {
      state.students = action.payload;
    },

    // Add student
    addStudent: (state, action) => {
      state.students.push(action.payload);
    },

    // Remove student
    removeStudent: (state, action) => {
      state.students = state.students.filter(
        s => s.socketId !== action.payload
      );
    },

    // Set past polls
    setPastPolls: (state, action) => {
      state.pastPolls = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset poll state
    resetPoll: (state) => {
      state.currentPoll = null;
      state.pollResults = null;
      state.hasAnswered = false;
      state.userAnswer = null;
      state.isPollActive = false;
      state.timeRemaining = 0;
      state.answerFeedback = null;
      state.error = null;
    }
  }
});

export const {
  setPollStarted,
  setPollResults,
  setAnswerSubmitted,
  setPollEnded,
  setTimeRemaining,
  setStudents,
  addStudent,
  removeStudent,
  setPastPolls,
  setError,
  clearError,
  resetPoll
} = pollSlice.actions;

export default pollSlice.reducer;
