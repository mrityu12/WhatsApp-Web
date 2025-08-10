const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  updateMessageStatus,
  markAsRead,
  getConversationStats,
  searchMessages
} = require('../controllers/messageController');

const router = express.Router();

// Get all conversations
router.get('/conversations', getConversations);

// Get conversation stats
router.get('/stats', getConversationStats);

// Search messages
router.get('/search', searchMessages);

// Get messages for a specific conversation
router.get('/:wa_id', getMessages);

// Send a new message
router.post('/send', sendMessage);

// Update message status
router.put('/status/:messageId', updateMessageStatus);

// Mark messages as read for a conversation
router.put('/read/:wa_id', markAsRead);

module.exports = router;