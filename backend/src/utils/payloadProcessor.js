const Message = require('../models/Message');
const { emitNewMessage, emitMessageStatus } = require('../config/websocket');

// Main function to process webhook payloads
const processWebhookPayload = async (payload) => {
  try {
    console.log('🔄 Processing webhook payload...');
    
    if (!payload.entry || !Array.isArray(payload.entry)) {
      throw new Error('Invalid payload structure: missing entry array');
    }
    
    const results = [];
    
    for (const entry of payload.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) {
        continue;
      }
      
      for (const change of entry.changes) {
        const result = await processChange(change);
        if (result) {
          results.push(result);
        }
      }
    }
    
    console.log(`✅ Processed ${results.length} changes successfully`);
    return {
      processed: true,
      results,
      totalChanges: results.length
    };
  } catch (error) {
    console.error('❌ Error processing webhook payload:', error);
    throw error;
  }
};

// Process individual change
const processChange = async (change) => {
  try {
    const { value, field } = change;
    
    if (!value) {
      console.log('⚠️ Skipping change with no value');
      return null;
    }
    
    const result = {
      field,
      messagesProcessed: 0,
      statusesProcessed: 0,
      errors: []
    };
    
    // Process messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        try {
          await processIncomingMessage(message, value.metadata, value.contacts);
          result.messagesProcessed++;
        } catch (error) {
          console.error('Error processing message:', error);
          result.errors.push({
            type: 'message',
            id: message.id,
            error: error.message
          });
        }
      }
    }
    
    // Process statuses
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        try {
          await processStatusUpdate(status);
          result.statusesProcessed++;
        } catch (error) {
          console.error('Error processing status:', error);
          result.errors.push({
            type: 'status',
            id: status.id,
            error: error.message
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error processing change:', error);
    throw error;
  }
};

// Process incoming message
const processIncomingMessage = async (messageData, metadata, contacts) => {
  try {
    // Find contact information
    const contact = contacts?.find(c => c.wa_id === messageData.from);
    
    // Create message document
    const messageDoc = {
      id: messageData.id,
      wa_id: messageData.from,
      profile_name: contact?.profile?.name || messageData.from,
      direction: 'inbound',
      timestamp: new Date(parseInt(messageData.timestamp) * 1000),
      type: messageData.type || 'text',
      status: 'delivered',
      raw_data: messageData
    };
    
    // Process message content based on type
    await processMessageContent(messageDoc, messageData);
    
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
    console.log(`💬 New message saved: ${savedMessage.id} from ${savedMessage.wa_id}`);
    
    // Emit via WebSocket
    emitNewMessage(savedMessage);
    
    return savedMessage;
  } catch (error) {
    console.error('Error processing incoming message:', error);
    throw error;
  }
};

// Process message content based on type
const processMessageContent = async (messageDoc, messageData) => {
  switch (messageData.type) {
    case 'text':
      messageDoc.text = messageData.text?.body || '';
      break;
      
    case 'image':
      messageDoc.media = {
        id: messageData.image?.id,
        mime_type: messageData.image?.mime_type,
        sha256: messageData.image?.sha256,
        caption: messageData.image?.caption
      };
      messageDoc.text = messageData.image?.caption || '📷 Image';
      break;
      
    case 'document':
      messageDoc.media = {
        id: messageData.document?.id,
        mime_type: messageData.document?.mime_type,
        sha256: messageData.document?.sha256,
        filename: messageData.document?.filename,
        caption: messageData.document?.caption
      };
      messageDoc.text = messageData.document?.filename || '📄 Document';
      break;
      
    case 'audio':
      messageDoc.media = {
        id: messageData.audio?.id,
        mime_type: messageData.audio?.mime_type,
        sha256: messageData.audio?.sha256
      };
      messageDoc.text = '🎵 Audio message';
      break;
      
    case 'video':
      messageDoc.media = {
        id: messageData.video?.id,
        mime_type: messageData.video?.mime_type,
        sha256: messageData.video?.sha256,
        caption: messageData.video?.caption
      };
      messageDoc.text = messageData.video?.caption || '🎥 Video';
      break;
      
    case 'location':
      messageDoc.location = {
        latitude: messageData.location?.latitude,
        longitude: messageData.location?.longitude,
        name: messageData.location?.name,
        address: messageData.location?.address
      };
      messageDoc.text = `📍 ${messageData.location?.name || messageData.location?.address || 'Location'}`;
      break;
      
    case 'contacts':
      messageDoc.contacts = messageData.contacts || [];
      const contactName = messageData.contacts?.[0]?.name?.formatted_name || 'Contact';
      messageDoc.text = `👤 ${contactName}`;
      break;
      
    case 'sticker':
      messageDoc.media = {
        id: messageData.sticker?.id,
        mime_type: messageData.sticker?.mime_type,
        sha256: messageData.sticker?.sha256
      };
      messageDoc.text = '😊 Sticker';
      break;
      
    default:
      messageDoc.text = `Unsupported message type: ${messageData.type}`;
      console.log(`⚠️ Unsupported message type: ${messageData.type}`);
  }
};

// Process status update
const processStatusUpdate = async (statusData) => {
  try {
    const { id, status, timestamp, recipient_id } = statusData;
    
    if (!id || !status) {
      throw new Error('Status update missing required fields');
    }
    
    // Find message by ID or meta_msg_id
    const message = await Message.findOne({
      $or: [
        { id: id },
        { meta_msg_id: id }
      ]
    });
    
    if (!message) {
      console.log(`⚠️ Message not found for status update: ${id}`);
      // Create a placeholder entry for status tracking
      const placeholderMessage = await Message.create({
        id: `placeholder_${id}`,
        meta_msg_id: id,
        wa_id: recipient_id || 'unknown',
        text: 'Status update for unknown message',
        type: 'text',
        direction: 'outbound',
        status: status,
        timestamp: new Date(parseInt(timestamp) * 1000),
        processed: false,
        raw_data: statusData
      });
      
      emitMessageStatus(placeholderMessage.id, status, placeholderMessage.wa_id);
      return placeholderMessage;
    }
    
    // Update message status
    const oldStatus = message.status;
    await message.updateStatus(status);
    
    console.log(`📊 Status updated for message ${id}: ${oldStatus} → ${status}`);
    
    // Emit status update via WebSocket
    emitMessageStatus(message.id, status, message.wa_id);
    
    return message;
  } catch (error) {
    console.error('Error processing status update:', error);
    throw error;
  }
};

// Batch process multiple payloads
const batchProcessPayloads = async (payloads) => {
  try {
    console.log(`🔄 Starting batch processing of ${payloads.length} payloads...`);
    
    const results = {
      total: payloads.length,
      processed: 0,
      failed: 0,
      errors: []
    };
    
    for (let i = 0; i < payloads.length; i++) {
      try {
        console.log(`Processing payload ${i + 1}/${payloads.length}`);
        await processWebhookPayload(payloads[i]);
        results.processed++;
      } catch (error) {
        console.error(`Failed to process payload ${i + 1}:`, error);
        results.failed++;
        results.errors.push({
          index: i,
          error: error.message
        });
      }
    }
    
    console.log(`✅ Batch processing complete: ${results.processed} processed, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Error in batch processing:', error);
    throw error;
  }
};

// Validate payload structure
const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a valid object');
  }
  
  if (!payload.entry || !Array.isArray(payload.entry)) {
    throw new Error('Payload must contain entry array');
  }
  
  for (const entry of payload.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) {
      throw new Error('Each entry must contain changes array');
    }
  }
  
  return true;
};

// Generate test payload
const generateTestPayload = (wa_id = '919876543210', messageText = 'Test message') => {
  return {
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
            id: `test_msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            from: wa_id,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: "text",
            text: {
              body: messageText
            }
          }],
          contacts: [{
            wa_id: wa_id,
            profile: {
              name: "Test User"
            }
          }]
        },
        field: "messages"
      }]
    }]
  };
};

module.exports = {
  processWebhookPayload,
  processChange,
  processIncomingMessage,
  processMessageContent,
  processStatusUpdate,
  batchProcessPayloads,
  validatePayload,
  generateTestPayload
};