const Message = require('../models/Message');
const { emitNewMessage, emitMessageStatus } = require('../config/websocket');

// Get all conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.getConversations();
    
    res.status(200).json({
      success: true,
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
  try {
    const { wa_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!wa_id) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp ID is required'
      });
    }
    
    const messages = await Message.getMessagesByWaId(
      wa_id, 
      parseInt(page), 
      parseInt(limit)
    );
    
    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ wa_id });
    
    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Send a new message (demo - save to database only)
const sendMessage = async (req, res) => {
  try {
    const { wa_id, text, type = 'text' } = req.body;
    
    if (!wa_id || !text) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp ID and message text are required'
      });
    }
    
    // Generate a unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage = new Message({
      id: messageId,
      wa_id,
      text,
      type,
      direction: 'outbound',
      status: 'sent',
      timestamp: new Date(),
      processed: true
    });
    
    const savedMessage = await newMessage.save();
    
    // Emit the new message via WebSocket
    emitNewMessage(savedMessage);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!messageId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and status are required'
      });
    }
    
    const validStatuses = ['sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const message = await Message.findOne({ 
      $or: [
        { id: messageId },
        { meta_msg_id: messageId }
      ]
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.updateStatus(status);
    
    // Emit status update via WebSocket
    emitMessageStatus(message.id, status, message.wa_id);
    
    res.status(200).json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { wa_id } = req.params;
    
    if (!wa_id) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp ID is required'
      });
    }
    
    const result = await Message.updateMany(
      { 
        wa_id,
        direction: 'inbound',
        status: { $ne: 'read' }
      },
      { 
        status: 'read',
        read_at: new Date()
      }
    );
    
    // Emit status updates via WebSocket
    const updatedMessages = await Message.find({ 
      wa_id,
      direction: 'inbound',
      status: 'read',
      read_at: { $exists: true }
    });
    
    updatedMessages.forEach(msg => {
      emitMessageStatus(msg.id, 'read', wa_id);
    });
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get conversation stats
const getConversationStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalConversations: { $addToSet: '$wa_id' },
          inboundMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] }
          },
          outboundMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] }
          },
          unreadMessages: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$direction', 'inbound'] }, 
                    { $ne: ['$status', 'read'] }
                  ] 
                }, 
                1, 
                0
              ] 
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          totalConversations: { $size: '$totalConversations' },
          inboundMessages: 1,
          outboundMessages: 1,
          unreadMessages: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalMessages: 0,
        totalConversations: 0,
        inboundMessages: 0,
        outboundMessages: 0,
        unreadMessages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching conversation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation stats',
      error: error.message
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { query, wa_id } = req.query;
    const { page = 1, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchFilter = {
      text: { $regex: query, $options: 'i' }
    };
    
    if (wa_id) {
      searchFilter.wa_id = wa_id;
    }
    
    const messages = await Message.find(searchFilter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const totalResults = await Message.countDocuments(searchFilter);
    
    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResults,
        totalPages: Math.ceil(totalResults / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  updateMessageStatus,
  markAsRead,
  getConversationStats,
  searchMessages
};