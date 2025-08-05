const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const router = express.Router();

// Get user's chats
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await Chat.getUserChats(userId);
    
    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
      const unreadCount = chat.messages.filter(m => 
        m.sender.toString() !== userId && !m.isRead
      ).length;
      
      return {
        id: chat._id,
        participant: {
          id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          email: otherParticipant.email,
          profilePicture: otherParticipant.profilePicture
        },
        lastMessage: chat.messages.length > 0 ? {
          content: chat.messages[chat.messages.length - 1].content,
          sender: chat.messages[chat.messages.length - 1].sender._id.toString() === userId ? 'me' : 'other',
          createdAt: chat.messages[chat.messages.length - 1].createdAt
        } : null,
        unreadCount,
        lastActivity: chat.lastMessage
      };
    });
    
    res.json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get specific chat with friend
router.get('/:friendId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.params;
    
    // Verify they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only chat with friends'
      });
    }
    
    const chat = await Chat.findOrCreateChat(userId, friendId);
    await chat.populate('participants', 'firstName lastName email profilePicture');
    await chat.populate('messages.sender', 'firstName lastName profilePicture');
    
    // Mark messages as read
    await chat.markAsRead(userId);
    
    const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
    
    res.json({
      success: true,
      chat: {
        id: chat._id,
        participant: {
          id: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          email: otherParticipant.email,
          profilePicture: otherParticipant.profilePicture
        },
        messages: chat.messages.map(message => ({
          id: message._id,
          content: message.content,
          sender: message.sender._id.toString() === userId ? 'me' : 'other',
          senderName: message.sender.firstName + ' ' + message.sender.lastName,
          messageType: message.messageType,
          brandKey: message.brandKey,
          isRead: message.isRead,
          createdAt: message.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Send a message
router.post('/:friendId/messages', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.params;
    const { content, messageType = 'text', brandKey = null } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Verify they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only send messages to friends'
      });
    }
    
    const chat = await Chat.findOrCreateChat(userId, friendId);
    await chat.addMessage(userId, content.trim(), messageType, brandKey);
    
    // Populate the new message
    await chat.populate('messages.sender', 'firstName lastName profilePicture');
    const newMessage = chat.messages[chat.messages.length - 1];
    
    res.json({
      success: true,
      message: {
        id: newMessage._id,
        content: newMessage.content,
        sender: 'me',
        senderName: newMessage.sender.firstName + ' ' + newMessage.sender.lastName,
        messageType: newMessage.messageType,
        brandKey: newMessage.brandKey,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Send a brand question
router.post('/:friendId/brand-question', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.params;
    const { brandKey, question } = req.body;
    
    if (!brandKey || !question) {
      return res.status(400).json({
        success: false,
        message: 'Brand key and question are required'
      });
    }
    
    // Verify they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only ask questions to friends'
      });
    }
    
    const chat = await Chat.findOrCreateChat(userId, friendId);
    const messageContent = `What do you like about ${brandKey}? ${question}`;
    await chat.addMessage(userId, messageContent, 'brand_question', brandKey);
    
    res.json({
      success: true,
      message: 'Brand question sent successfully'
    });
  } catch (error) {
    console.error('Error sending brand question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router; 