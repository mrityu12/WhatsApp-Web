const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // WhatsApp Message ID
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Meta message ID for status tracking
  meta_msg_id: {
    type: String,
    sparse: true
  },
  
  // WhatsApp ID (phone number)
  wa_id: {
    type: String,
    required: true,
    index: true
  },
  
  // Contact information
  profile_name: {
    type: String,
    default: ''
  },
  
  // Message content
  text: {
    type: String,
    default: ''
  },
  
  // Message type (text, image, document, etc.)
  type: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'contacts'],
    default: 'text'
  },
  
  // Message direction
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    required: true
  },
  
  // Status timestamps
  delivered_at: {
    type: Date
  },
  
  read_at: {
    type: Date
  },
  
  // Media information (for non-text messages)
  media: {
    id: String,
    mime_type: String,
    sha256: String,
    filename: String,
    caption: String
  },
  
  // Location information
  location: {
    latitude: Number,
    longitude: Number,
    name: String,
    address: String
  },
  
  // Contacts information
  contacts: [{
    name: {
      formatted_name: String,
      first_name: String,
      last_name: String
    },
    phones: [{
      phone: String,
      type: String
    }],
    emails: [{
      email: String,
      type: String
    }]
  }],
  
  // Context (reply information)
  context: {
    from: String,
    id: String,
    referred_product: {
      catalog_id: String,
      product_retailer_id: String
    }
  },
  
  // Raw webhook data for debugging
  raw_data: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // System fields
  processed: {
    type: Boolean,
    default: true
  },
  
  error: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'processed_messages'
});

// Indexes for better query performance
messageSchema.index({ wa_id: 1, timestamp: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ meta_msg_id: 1 });
messageSchema.index({ direction: 1 });
messageSchema.index({ type: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formatted_timestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Static method to get conversations
messageSchema.statics.getConversations = async function() {
  return this.aggregate([
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: '$wa_id',
        lastMessage: { $first: '$$ROOT' },
        totalMessages: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$direction', 'inbound'] }, { $ne: ['$status', 'read'] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        wa_id: '$_id',
        profile_name: '$lastMessage.profile_name',
        lastMessage: {
          text: '$lastMessage.text',
          timestamp: '$lastMessage.timestamp',
          type: '$lastMessage.type',
          direction: '$lastMessage.direction'
        },
        totalMessages: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.timestamp': -1 }
    }
  ]);
};

// Static method to get messages by wa_id
messageSchema.statics.getMessagesByWaId = async function(wa_id, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ wa_id })
    .sort({ timestamp: 1 })
    .skip(skip)
    .limit(limit);
};

// Method to update message status
messageSchema.methods.updateStatus = async function(status) {
  this.status = status;
  
  if (status === 'delivered') {
    this.delivered_at = new Date();
  } else if (status === 'read') {
    this.read_at = new Date();
  }
  
  return this.save();
};

// Pre-save middleware to set default values
messageSchema.pre('save', function(next) {
  if (!this.profile_name && this.wa_id) {
    this.profile_name = this.wa_id;
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;