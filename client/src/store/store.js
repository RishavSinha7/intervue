/**
 * Redux store configuration
 * Combines all slices and configures the store
 */

import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './pollSlice';
import studentReducer from './studentSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    student: studentReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['poll/setPollResults'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['poll.startTime']
      }
    })
});

export default store;
