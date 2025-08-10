// backend/src/config/websocket.js
const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    path: "/socket.io", // explicit path to match frontend
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // ensure fallback
  });

  io.on("connection", (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join user to their room
    socket.on("join_user_room", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
      }
    });

    // Typing indicator
    socket.on("typing", ({ chatId, userId }) => {
      if (chatId && userId) {
        socket.to(chatId).emit("user_typing", { userId, isTyping: true });
      }
    });

    socket.on("stop_typing", ({ chatId, userId }) => {
      if (chatId && userId) {
        socket.to(chatId).emit("user_typing", { userId, isTyping: false });
      }
    });

    // User presence
    socket.on("user_online", (userId) => {
      if (userId) {
        socket.broadcast.emit("user_status", {
          userId,
          status: "online",
          lastSeen: new Date(),
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`👤 User disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  console.log("🔌 Socket.IO initialized");
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Utility emitters
const emitNewMessage = (message) => {
  if (io) io.emit("new_message", message);
};

const emitMessageStatus = (messageId, status, chatId) => {
  if (io) {
    io.emit("message_status_update", {
      messageId,
      status,
      chatId,
      timestamp: new Date(),
    });
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitNewMessage,
  emitMessageStatus,
  emitToUser,
};
