/**
 * Socket.io client configuration
 * Manages real-time connection to the server
 */

import { io } from 'socket.io-client';

// Use Vite environment variable with fallback for local development
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect immediately
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Debug logging for connection events
socket.on('connect', () => {
  console.log('Socket connected to server:', SOCKET_URL);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected from server');
});

export default socket;
