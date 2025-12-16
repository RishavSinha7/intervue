/**
 * Main server file
 * Sets up Express and Socket.io server
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
// RENDER DEPLOYMENT: Dynamically allows origin from environment variable
// In production, CORS_ORIGIN should be set to your frontend URL (e.g., https://yourapp.vercel.app)
// Multiple origins can be supported by setting CORS_ORIGIN as comma-separated values
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
// RENDER DEPLOYMENT: Enable CORS for REST endpoints (if any are added in future)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Live Polling Server is running' });
});

// Initialize Socket.io handlers
initializeSocket(io);

// Start server
// RENDER DEPLOYMENT: Uses PORT from environment (Render assigns this automatically)
// Defaults to 4000 for local development only
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   Live Polling Server Started          ║
║   Port: ${PORT}                        ║
║   Socket.io: Ready                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
