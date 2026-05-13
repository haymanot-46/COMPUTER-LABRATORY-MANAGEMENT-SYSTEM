const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

let io = null;
let connectedUsers = new Map(); // Store connected users: userId -> socketId
let userSockets = new Map(); // Store socketId -> userId

// Initialize Socket.IO
const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: Account deactivated'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const { user } = socket;
    logger.info(`User connected: ${user.email} (${user.role}) - Socket ID: ${socket.id}`);

    // Store connection
    connectedUsers.set(user.id, socket.id);
    userSockets.set(socket.id, user.id);

    // Join user to role-based room
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to CLMS WebSocket server',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString()
    });

    // Broadcast user online status
    io.emit('user:status', {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      status: 'online',
      timestamp: new Date().toISOString()
    });

    // Import and setup module-specific handlers
    require('./computerStatus')(io, socket);
    require('./attendanceSync')(io, socket);
    require('./notifications')(io, socket);

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.email} - Socket ID: ${socket.id}`);
      
      // Remove from stores
      connectedUsers.delete(user.id);
      userSockets.delete(socket.id);
      
      // Broadcast user offline status
      io.emit('user:status', {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${user.email}:`, error);
    });
  });

  return io;
};

// Get IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};

// Get connected users count
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Get user socket ID
const getUserSocketId = (userId) => {
  return connectedUsers.get(userId);
};

// Check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Send message to specific user
const sendToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Send message to role group
const sendToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    return true;
  }
  return false;
};

// Broadcast to all connected clients
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initSocket,
  getIO,
  getConnectedUsersCount,
  getUserSocketId,
  isUserOnline,
  sendToUser,
  sendToRole,
  broadcast
};