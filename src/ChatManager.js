import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatManager.css';

const ChatManager = ({ user, onUpdateUser, onUnreadCountChange, selectedFriendId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChatObject, setCurrentChatObject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBrandQuestion, setShowBrandQuestion] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandQuestion, setBrandQuestion] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  const token = localStorage.getItem('token');

  // Load user's chats
  const loadChats = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setChats(response.data.chats);
        console.log('💬 Loaded chats:', response.data.chats);
        
        // Calculate total unread count
        const totalUnread = response.data.chats.reduce((total, chat) => {
          return total + (chat.unreadCount || 0);
        }, 0);
        
        // Pass total unread count to parent
        if (onUnreadCountChange) {
          onUnreadCountChange(totalUnread);
        }
      } else {
        setError('Failed to load chats');
      }
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific chat
  const loadMessages = async (chat) => {
    if (!token || !chat) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Use the friend ID from the chat
      const friendId = chat.participant?.id || chat.participants?.find(p => p._id !== user.id)?._id;
      
      console.log('🔍 Loading messages for chat:', {
        chatId: chat._id,
        friendId: friendId,
        participant: chat.participant,
        participants: chat.participants
      });
      
      if (!friendId) {
        setError('Could not identify friend in chat');
        console.error('❌ No friend ID found in chat');
        return;
      }
      
      const response = await axios.get(`http://localhost:3001/api/chats/${friendId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Chat API response:', response.data);

      if (response.data.success) {
        console.log('📝 Setting messages:', response.data.chat.messages);
        setMessages(response.data.chat.messages);
        console.log('💬 Loaded messages for chat with friend:', friendId, 'Message count:', response.data.chat.messages.length);
      } else {
        setError('Failed to load messages');
        console.error('❌ API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!token || !selectedChat || !newMessage.trim()) return;
    
    try {
      // Use the stored current chat object
      const currentChat = currentChatObject;
      console.log('🔍 Using current chat object:', {
        selectedChat: selectedChat,
        currentChatObject: currentChat
      });
      
      if (!currentChat) {
        setError('Could not find current chat');
        return;
      }
      
      const friendId = currentChat.participant?.id || currentChat.participants?.find(p => p._id !== user.id)?._id;
      if (!friendId) {
        setError('Could not identify friend in chat');
        return;
      }
      
      const response = await axios.post(`http://localhost:3001/api/chats/${friendId}/messages`, {
        content: newMessage.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNewMessage('');
        // Reload messages to show the new message
        await loadMessages(currentChat);
        // Reload chats to update unread counts
        await loadChats();
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    console.log('🎯 Chat selected:', {
      chatId: chat.id || chat._id,
      friendName: getFriendName(chat),
      unreadCount: chat.unreadCount,
      fullChatObject: chat
    });
    
    // Use chat.id if available, otherwise use chat._id
    const chatId = chat.id || chat._id;
    setSelectedChat(chatId);
    setCurrentChatObject(chat);
    await loadMessages(chat);
    
    // Mark messages as read when chat is selected
    if (chat.unreadCount > 0) {
      try {
        const friendId = chat.participant?.id || chat.participants?.find(p => p._id !== user.id)?._id;
        if (friendId) {
          await axios.post(`http://localhost:3001/api/chats/${friendId}/mark-read`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Reload chats to update unread counts
          await loadChats();
        }
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    }
  };

  // Send a brand question
  const sendBrandQuestion = async () => {
    if (!token || !selectedChat || !selectedBrand || !brandQuestion.trim()) return;
    
    try {
      // Find the current chat to get the friend ID
      const currentChat = currentChatObject;
      if (!currentChat) {
        setError('Could not find current chat');
        return;
      }
      
      const friendId = currentChat.participant?.id || currentChat.participants?.find(p => p._id !== user.id)?._id;
      if (!friendId) {
        setError('Could not identify friend in chat');
        return;
      }
      
      const response = await axios.post(`http://localhost:3001/api/chats/${friendId}/brand-question`, {
        brandKey: selectedBrand,
        question: brandQuestion.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setShowBrandQuestion(false);
        setSelectedBrand('');
        setBrandQuestion('');
        // Reload messages to show the new message
        await loadMessages(currentChat);
        // Reload chats to update unread counts
        await loadChats();
      } else {
        setError('Failed to send brand question');
      }
    } catch (error) {
      console.error('❌ Error sending brand question:', error);
      setError('Failed to send brand question');
    }
  };

  // Handle enter key in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Auto-select chat if selectedFriendId is provided
  useEffect(() => {
    if (selectedFriendId && chats.length > 0) {
      const chat = chats.find(c => c.participant?.id === selectedFriendId);
      if (chat) {
        handleChatSelect(chat);
      }
    }
  }, [selectedFriendId, chats]);

  // Auto-refresh chats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadChats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getFriendName = (chat) => {
    if (chat.participant) {
      return `${chat.participant.firstName} ${chat.participant.lastName}`;
    }
    if (chat.participants && Array.isArray(chat.participants)) {
      const friend = chat.participants.find(p => p._id !== user.id);
      return friend ? `${friend.firstName} ${friend.lastName}` : 'Unknown User';
    }
    return 'Unknown User';
  };

  const getUnreadCount = (chat) => {
    return chat.unreadCount || 0;
  };

  const hasUnreadMessages = (chat) => {
    return getUnreadCount(chat) > 0;
  };

  return (
    <div className="chat-manager">
      <div className="chat-header">
        <h2>💬 Chats</h2>
        <p>Message your friends about brands and sales</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="chat-container">
        {/* Chat List */}
        <div className="chat-list">
          <h3>Conversations</h3>
          {loading ? (
            <div className="loading-spinner-small"></div>
          ) : chats.length === 0 ? (
            <div className="no-chats">
              <p>No conversations yet</p>
              <p className="subtext">Start chatting with your friends from the Friends tab!</p>
            </div>
          ) : (
            <div className="chat-items">
              {chats.map((chat) => (
                <div 
                  key={chat.id || chat._id} 
                  className={`chat-item ${selectedChat === (chat.id || chat._id) ? 'active' : ''} ${hasUnreadMessages(chat) ? 'unread' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-item-content">
                    <div className="chat-friend-info">
                      <div className="friend-avatar">
                        <span className="avatar-placeholder">
                          {getFriendName(chat).charAt(0)}
                        </span>
                      </div>
                      <div className="chat-details">
                        <h4>{getFriendName(chat)}</h4>
                        <p className="last-message">
                          {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    {hasUnreadMessages(chat) && (
                      <div className="unread-badge">
                        {getUnreadCount(chat)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {console.log('🔍 selectedChat:', selectedChat, 'messages.length:', messages.length)}
          {selectedChat ? (
            <>
              <div className="chat-header-bar">
                <h3>{getFriendName(chats.find(c => (c.id || c._id) === selectedChat))}</h3>
                <div className="chat-header-actions">
                  <button 
                    className="ask-brands-btn"
                    onClick={() => setShowBrandQuestion(true)}
                  >
                    Ask About Brands
                  </button>
                  <button 
                    className="back-to-chats"
                    onClick={() => {
                      setSelectedChat(null);
                      setCurrentChatObject(null);
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
              
              <div className="messages-container">
                {loading ? (
                  <div className="loading-spinner-small"></div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p className="subtext">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {console.log('🎨 Rendering messages:', messages)}
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`message ${message.sender === 'me' ? 'me' : 'other'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="2"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Brand Question Modal */}
      {showBrandQuestion && currentChatObject && (
        <div className="brand-question-modal">
          <div className="brand-question-content">
            <h3>Ask about {getFriendName(currentChatObject)}'s brands</h3>
            <div className="brand-selection">
              <label>Select a brand:</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Choose a brand...</option>
                {user.favoriteBrands && user.favoriteBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="question-input">
              <label>Your question:</label>
              <textarea
                value={brandQuestion}
                onChange={(e) => setBrandQuestion(e.target.value)}
                placeholder="What would you like to know about this brand?"
                rows="3"
              />
            </div>
            <div className="brand-question-actions">
              <button onClick={sendBrandQuestion}>Send Question</button>
              <button onClick={() => setShowBrandQuestion(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatManager; 