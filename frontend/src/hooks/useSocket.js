import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  // Initialize socket once
  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      return socketRef.current;
    }

    const socketURL = url || process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    console.log('Initializing socket connection to:', socketURL);

    const socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: false,
    });

    socketRef.current = socket;
    return socket;
  }, [url]);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) {
      console.error('Failed to initialize socket');
      return;
    }

    // Connection event handlers
    const handleConnect = () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    };

    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      setMessages((prev) => [...prev, message]);
    };

    const handleMessageStatusUpdate = (update) => {
      console.log('Message status update:', update);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === update.messageId ? { ...msg, status: update.status } : msg
        )
      );
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new_message', handleNewMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        socket.off('new_message', handleNewMessage);
        socket.off('message_status_update', handleMessageStatusUpdate);
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket]);

  // Send a message if connected
  const sendMessage = useCallback(
    (messageData) => {
      const socket = socketRef.current;
      if (socket && isConnected) {
        console.log('Sending message:', messageData);
        socket.emit('send_message', messageData);
      } else {
        console.error('Socket not connected. Connection status:', isConnected);
      }
    },
    [isConnected]
  );

  // Join a chat room if connected
  const joinChat = useCallback(
    (chatId) => {
      const socket = socketRef.current;
      if (socket && isConnected) {
        console.log('Joining chat:', chatId);
        socket.emit('join_chat', chatId);
      } else {
        console.error('Socket not connected for joinChat. Status:', isConnected);
      }
    },
    [isConnected]
  );

  // Leave a chat room if connected
  const leaveChat = useCallback(
    (chatId) => {
      const socket = socketRef.current;
      if (socket && isConnected) {
        console.log('Leaving chat:', chatId);
        socket.emit('leave_chat', chatId);
      }
    },
    [isConnected]
  );

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    sendMessage,
    joinChat,
    leaveChat,
    setMessages, // expose setter if needed externally
  };
};

export default useSocket;
