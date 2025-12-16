/**
 * Student Slice - Redux state management for student data
 * Manages student name, connection status, and chat messages
 */

import { createSlice } from '@reduxjs/toolkit';

// IDENTITY FIX: Student identity is socket-based ONLY
// Each browser tab/refresh = NEW student session
// No localStorage to prevent accidental name reuse across tabs
const initialState = {
  name: '', // Always empty - must be set on join
  socketId: null,
  isConnected: false,
  isTeacher: false,
  messages: [],
  showChat: false,
  kicked: false // Track if student has been kicked
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    // Set student name (socket-session only, NOT persisted)
    setStudentName: (state, action) => {
      state.name = action.payload;
      // NO localStorage - identity is per-socket, per-tab
    },

    // Set socket ID
    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },

    // Set connection status
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },

    // Set teacher mode
    setTeacherMode: (state, action) => {
      state.isTeacher = action.payload;
    },

    // Add chat message
    addMessage: (state, action) => {
      state.messages.push({
        ...action.payload,
        id: Date.now() + Math.random()
      });
    },

    // Toggle chat visibility
    toggleChat: (state) => {
      state.showChat = !state.showChat;
    },

    // Clear messages
    clearMessages: (state) => {
      state.messages = [];
    },

    // Disconnect
    disconnect: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },

    // Set kicked status
    setKicked: (state, action) => {
      state.kicked = action.payload;
      if (action.payload) {
        // When kicked, force disconnect and hide chat
        state.isConnected = false;
        state.showChat = false;
      }
    }
  }
});

export const {
  setStudentName,
  setSocketId,
  setConnected,
  setTeacherMode,
  addMessage,
  toggleChat,
  clearMessages,
  disconnect,
  setKicked
} = studentSlice.actions;

export default studentSlice.reducer;
