/**
 * Socket.io client configuration
 * Manages real-time connection to the server
 */

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect immediately
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
