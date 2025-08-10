const Message = require('../models/Message');
const { processWebhookPayload } = require('../utils/payloadProcessor');
const { emitNewMessage, emitMessageStatus } = require('../config/websocket');

// Process webhook payload
const processWebhook = async (req, res) => {
  try {
    const payload = req.body;
    
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Webhook payload is required'
      });
    }
    
    console.log('📨 Received webhook payload:', JSON.stringify(payload, null, 2));
    
    // Process the payload
    const result = await processWebhookPayload(payload);
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};

// Webhook verification (for WhatsApp Business API)
const verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Check if mode and token are valid
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      res.status(403).json({
        success: false,
        message: 'Webhook verification failed'
      });
    }
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook verification error',
      error: error.message
    });
  }
};

// Process message webhook
const processMessageWebhook = async (payload) => {
  try {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    if (!value) {
      throw new Error('Invalid webhook payload structure');
    }
    
    // Process messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        await processIncomingMessage(message, value.metadata, value.contacts);
      }
    }
    
    // Process statuses
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await processMessageStatus(status);
      }
    }
    
    return {
      processed: true,
      messagesCount: value.messages?.length || 0,
      statusesCount: value.statuses?.length || 0
    };
  } catch (error) {
    console.error('Error processing message webhook:', error);
    throw error;
  }
};

// Process incoming message
const processIncomingMessage = async (messageData, metadata, contacts) => {
  try {
    const contact = contacts?.find(c => c.wa_id === messageData.from);
    
    const messageDoc = {
      id: messageData.id,
      wa_id: messageData.from,
      profile_name: contact?.profile?.name || messageData.from,
      direction: 'inbound',
      timestamp: new Date(parseInt(messageData.timestamp) * 1000),
      type: messageData.type,
      status: 'delivered',
      raw_data: messageData
    };
    
    // Process different message types
    switch (messageData.type) {
      case 'text':
        messageDoc.text = messageData.text?.body || '';
        break;
        
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        messageDoc.media = {
          id: messageData[messageData.type]?.id,
          mime_type: messageData[messageData.type]?.mime_type,
          sha256: messageData[messageData.type]?.sha256,
          filename: messageData[messageData.type]?.filename,
          caption: messageData[messageData.type]?.caption
        };
        messageDoc.text = messageData[messageData.type]?.caption || '';
        break;
        
      case 'location':
        messageDoc.location = {
          latitude: messageData.location?.latitude,
          longitude: messageData.location?.longitude,
          name: messageData.location?.name,
          address: messageData.location?.address
        };
        messageDoc.text = `Location: ${messageData.location?.name || 'Shared location'}`;
        break;
        
      case 'contacts':
        messageDoc.contacts = messageData.contacts || [];
        messageDoc.text = `Contact: ${messageData.contacts?.[0]?.name?.formatted_name || 'Shared contact'}`;
        break;
        
      default:
        messageDoc.text = `Unsupported message type: ${messageData.type}`;
    }
    
    // Handle context (replies)
    if (messageData.context) {
      messageDoc.context = messageData.context;
    }
    
    // Check if message already exists
    const existingMessage = await Message.findOne({ id: messageData.id });
    if (existingMessage) {
      console.log(`📝 Message ${messageData.id} already exists`);
      return existingMessage;
    }
    
    // Save message
    const savedMessage = await Message.create(messageDoc);
    console.log(`💬 New message saved: ${savedMessage.id}`);
    
    // Emit via WebSocket
    emitNewMessage(savedMessage);
    
    return savedMessage;
  } catch (error) {
    console.error('Error processing incoming message:', error);
    throw error;
  }
};

// Process message status update
const processMessageStatus = async (statusData) => {
  try {
    const { id, status, timestamp, recipient_id } = statusData;
    
    // Find message by ID or meta_msg_id
    const message = await Message.findOne({
      $or: [
        { id: id },
        { meta_msg_id: id }
      ]
    });
    
    if (!message) {
      console.log(`⚠️ Message not found for status update: ${id}`);
      return null;
    }
    
    // Update message status
    await message.updateStatus(status);
    console.log(`📊 Status updated for message ${id}: ${status}`);
    
    // Emit status update via WebSocket
    emitMessageStatus(message.id, status, message.wa_id);
    
    return message;
  } catch (error) {
    console.error('Error processing message status:', error);
    throw error;
  }
};

// Test webhook endpoint
const testWebhook = async (req, res) => {
  try {
    const testPayload = {
      entry: [{
        id: "test_entry",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "1234567890",
              phone_number_id: "test_phone_id"
            },
            messages: [{
              id: `test_msg_${Date.now()}`,
              from: "919876543210",
              timestamp: Math.floor(Date.now() / 1000).toString(),
              type: "text",
              text: {
                body: "This is a test message from webhook"
              }
            }],
            contacts: [{
              wa_id: "919876543210",
              profile: {
                name: "Test User"
              }
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    const result = await processWebhookPayload(testPayload);
    
    res.status(200).json({
      success: true,
      message: 'Test webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error processing test webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process test webhook',
      error: error.message
    });
  }
};

module.exports = {
  processWebhook,
  verifyWebhook,
  processMessageWebhook,
  processIncomingMessage,
  processMessageStatus,
  testWebhook
};