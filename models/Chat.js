const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'brand_question', 'brand_recommendation'],
    default: 'text'
  },
  brandKey: {
    type: String,
    required: function() { return this.messageType === 'brand_question' || this.messageType === 'brand_recommendation'; }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ participants: 1, lastMessage: -1 });
chatSchema.index({ 'messages.createdAt': -1 });

// Method to add a message to the chat
chatSchema.methods.addMessage = function(senderId, content, messageType = 'text', brandKey = null) {
  const message = {
    sender: senderId,
    content,
    messageType,
    brandKey,
    createdAt: new Date()
  };
  
  this.messages.push(message);
  this.lastMessage = new Date();
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
    }
  });
  
  return this.save();
};

// Static method to find or create chat between two users
chatSchema.statics.findOrCreateChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    participants: { $all: [user1Id, user2Id] }
  });
  
  if (!chat) {
    chat = new this({
      participants: [user1Id, user2Id],
      messages: []
    });
    await chat.save();
  }
  
  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = function(userId) {
  return this.find({ participants: userId })
    .populate('participants', 'firstName lastName email profilePicture')
    .populate('messages.sender', 'firstName lastName profilePicture')
    .sort({ lastMessage: -1 });
};

module.exports = mongoose.model('Chat', chatSchema); 