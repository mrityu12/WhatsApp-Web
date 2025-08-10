// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Single CORS origin
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

// Configure CORS for Express
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhatsApp Web Clone API is running!',
    timestamp: new Date().toISOString(),
    cors: corsOrigin
  });
});

// Debug route to check environment
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    CORS_ORIGIN_LENGTH: process.env.CORS_ORIGIN?.length,
    CORS_ORIGIN_CHARS: process.env.CORS_ORIGIN?.split('').map(c => c.charCodeAt(0))
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    cors: corsOrigin
  });
});

// API Routes
app.get('/api/messages/conversations', (req, res) => {
  // Sample conversations data
  const conversations = [
    {
      id: 'chat1',
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      timestamp: new Date().toISOString(),
      unreadCount: 2
    },
    {
      id: 'chat2',
      name: 'Jane Smith', 
      lastMessage: 'See you tomorrow!',
      timestamp: new Date().toISOString(),
      unreadCount: 0
    }
  ];
  
  res.json(conversations);
});

app.get('/api/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  
  // Sample messages data
  const messages = [
    {
      id: 'msg1',
      chatId,
      sender: 'John Doe',
      content: 'Hello there!',
      timestamp: new Date().toISOString(),
      type: 'text'
    },
    {
      id: 'msg2',
      chatId,
      sender: 'me',
      content: 'Hi! How are you?',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ];
  
  res.json(messages);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send welcome message
  socket.emit('welcome', { 
    message: 'Connected successfully',
    socketId: socket.id 
  });

  // Handle joining a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
    socket.emit('joined_chat', { chatId });
  });

  // Handle leaving a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat ${chatId}`);
    socket.emit('left_chat', { chatId });
  });

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    console.log('Message received:', messageData);
    
    const message = {
      id: Date.now().toString(),
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    // Send to sender (confirmation)
    socket.emit('message_sent', message);
    
    // Broadcast to all users in the chat room
    socket.to(messageData.chatId).emit('new_message', message);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      userId: socket.id,
      chatId: data.chatId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.chatId).emit('user_stopped_typing', {
      userId: socket.id,
      chatId: data.chatId
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${corsOrigin}`);
  console.log(`🔌 Socket.IO ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };