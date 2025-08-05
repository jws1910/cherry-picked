import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FriendManager.css';

const FriendManager = ({ user, onUpdateUser, onSwitchToChats }) => {
  // Helper functions for brand data
  const getBrandUrl = (brandKey) => {
    const brandUrls = {
      'acne': 'https://www.acnestudios.com',
      'anthropologie': 'https://www.anthropologie.com',
      'apc': 'https://www.apc.fr',
      'aritzia': 'https://www.aritzia.com',
      'arket': 'https://www.arket.com',
      'axel': 'https://www.axelarigato.com',
      'cos': 'https://www.cos.com',
      'cultgaia': 'https://www.cultgaia.com',
      'everlane': 'https://www.everlane.com',
      'faithfull': 'https://www.faithfullthebrand.com',
      'freepeople': 'https://www.freepeople.com',
      'ganni': 'https://www.ganni.com',
      'goldengoose': 'https://www.goldengoose.com',
      'hm': 'https://www.hm.com',
      'isabelmarant': 'https://www.isabelmarant.com',
      'iro': 'https://www.iro-paris.com',
      'madewell': 'https://www.madewell.com',
      'maje': 'https://www.maje.com',
      'mango': 'https://www.mango.com',
      'massimodutti': 'https://www.massimodutti.com',
      'nanushka': 'https://www.nanushka.com',
      'otherstories': 'https://www.otherstories.com',
      'ragandbone': 'https://www.rag-bone.com',
      'realisation': 'https://www.realisationpar.com',
      'reformation': 'https://www.thereformation.com',
      'rouje': 'https://www.rouje.com',
      'sandro': 'https://www.sandro-paris.com',
      'sezane': 'https://www.sezane.com',
      'staud': 'https://www.staud.clothing',
      'theory': 'https://www.theory.com',
      'toteme': 'https://www.toteme.com',
      'uniqlo': 'https://www.uniqlo.com',
      'urbanoutfitters': 'https://www.urbanoutfitters.com',
      'veja': 'https://www.veja-store.com',
      'zara': 'https://www.zara.com'
    };
    return brandUrls[brandKey] || '#';
  };

  const getBrandName = (brandKey) => {
    const brandNames = {
      'acne': 'Acne Studios',
      'anthropologie': 'Anthropologie',
      'apc': 'A.P.C.',
      'aritzia': 'Aritzia',
      'arket': 'Arket',
      'axel': 'Axel Arigato',
      'cos': 'COS',
      'cultgaia': 'Cult Gaia',
      'everlane': 'Everlane',
      'faithfull': 'Faithfull the Brand',
      'freepeople': 'Free People',
      'ganni': 'Ganni',
      'goldengoose': 'Golden Goose',
      'hm': 'H&M',
      'isabelmarant': 'Isabel Marant',
      'iro': 'IRO',
      'madewell': 'Madewell',
      'maje': 'Maje',
      'mango': 'Mango',
      'massimodutti': 'Massimo Dutti',
      'nanushka': 'Nanushka',
      'otherstories': '& Other Stories',
      'ragandbone': 'Rag & Bone',
      'realisation': 'Réalisation Par',
      'reformation': 'Reformation',
      'rouje': 'Rouje',
      'sandro': 'Sandro',
      'sezane': 'Sézane',
      'staud': 'Staud',
      'theory': 'Theory',
      'toteme': 'Totême',
      'uniqlo': 'Uniqlo',
      'urbanoutfitters': 'Urban Outfitters',
      'veja': 'Veja',
      'zara': 'Zara'
    };
    return brandNames[brandKey] || brandKey;
  };

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBrandQuestion, setShowBrandQuestion] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandQuestion, setBrandQuestion] = useState('');
  const [showFriendBrands, setShowFriendBrands] = useState(false);
  const [friendBrandsData, setFriendBrandsData] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user?.id]);

  const loadFriendsData = async () => {
    console.log('🔍 Starting to load friends data...');
    console.log('🔑 Token present:', !!token);
    console.log('👤 User ID:', user?.id);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Making API requests...');
      
      // First, try to get all friends data in one call
      const friendsRes = await axios.get('http://localhost:3001/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Friends response:', friendsRes.data);
      
      if (friendsRes.data.success) {
        setFriends(friendsRes.data.friends || []);
        setPendingRequests(friendsRes.data.pendingRequests || []);
        setSentRequests(friendsRes.data.sentRequests || []);
        
        console.log('📋 Set friends:', friendsRes.data.friends?.length || 0);
        console.log('📋 Set pending requests:', friendsRes.data.pendingRequests?.length || 0);
        console.log('📋 Set sent requests:', friendsRes.data.sentRequests?.length || 0);
      } else {
        console.error('❌ Friends API returned success: false:', friendsRes.data);
        setError('API returned error: ' + (friendsRes.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error loading friends data:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      setError('Failed to load friends data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      console.log('🏁 Finished loading friends data');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post('http://localhost:3001/api/friends/request/send', {
        targetUserId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Refresh data
      loadFriendsData();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      await axios.post('http://localhost:3001/api/friends/request/accept', {
        fromUserId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadFriendsData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      await axios.post('http://localhost:3001/api/friends/request/reject', {
        fromUserId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadFriendsData();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request');
    }
  };

  const cancelFriendRequest = async (userId) => {
    try {
      await axios.post('http://localhost:3001/api/friends/request/cancel', {
        toUserId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadFriendsData();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      setError('Failed to cancel friend request');
    }
  };

  const removeFriend = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/friends/remove', {
        friendUserId: userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      loadFriendsData();
    } catch (error) {
      console.error('Error removing friend:', error);
      setError('Failed to remove friend');
    }
  };

  const viewFriendBrands = async (friendId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/friends/friend/${friendId}/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFriendBrandsData(response.data.friend);
        setShowFriendBrands(true);
      }
    } catch (error) {
      console.error('Error viewing friend brands:', error);
      alert('Failed to load friend\'s brands');
    }
  };

  const openChat = async (friend) => {
    // Switch to chats tab and open the specific chat
    if (onSwitchToChats) {
      onSwitchToChats(friend._id);
    } else {
      // Fallback to local chat modal
      setSelectedFriend(friend);
      setShowChat(true);
      setChatMessages([]);
      
      try {
        const response = await axios.get(`http://localhost:3001/api/chats/${friend._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setChatMessages(response.data.chat.messages);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        setError('Failed to load chat');
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    
    try {
      const response = await axios.post(`http://localhost:3001/api/chats/${selectedFriend._id}/messages`, {
        content: newMessage.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setChatMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const sendBrandQuestion = async () => {
    if (!selectedBrand || !brandQuestion.trim() || !selectedFriend) return;
    
    try {
      const response = await axios.post(`http://localhost:3001/api/chats/${selectedFriend._id}/brand-question`, {
        brandKey: selectedBrand,
        question: brandQuestion.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setShowBrandQuestion(false);
        setSelectedBrand('');
        setBrandQuestion('');
        // Reload chat messages
        const chatResponse = await axios.get(`http://localhost:3001/api/chats/${selectedFriend._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (chatResponse.data.success) {
          setChatMessages(chatResponse.data.chat.messages);
        }
      }
    } catch (error) {
      console.error('Error sending brand question:', error);
      setError('Failed to send brand question');
    }
  };

  if (!user) {
    return (
      <div className="friend-manager-container">
        <div className="no-user-message">
          <p>Please log in to access friend features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-manager-container">
      <div className="friend-manager-header">
        <h2>Friends</h2>
        <div className="friend-stats">
          <span>{friends.length} Friends</span>
          <span>{pendingRequests.length} Pending Requests</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="friend-tabs">
        <button 
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({pendingRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Friends
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="friends-tab">
          {friends.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any friends yet.</p>
              <p>Use the "Find Friends" tab to discover and connect with other users!</p>
            </div>
          ) : (
            <div className="friends-grid">
              {friends.map(friend => (
                <div key={friend._id} className="friend-card">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={`${friend.firstName} ${friend.lastName}`} />
                      ) : (
                        <div className="avatar-placeholder">
                          {friend.firstName.charAt(0)}{friend.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="friend-details">
                      <h3>{friend.firstName} {friend.lastName}</h3>
                      <p>{friend.email}</p>
                      {friend.favoriteBrands && friend.favoriteBrands.length > 0 && (
                        <p className="friend-brands">
                          Brands: {friend.favoriteBrands.slice(0, 3).join(', ')}
                          {friend.favoriteBrands.length > 3 && ` +${friend.favoriteBrands.length - 3} more`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button 
                      className="chat-btn"
                      onClick={() => openChat(friend)}
                    >
                      💬 Chat
                    </button>
                    <button 
                      className="view-brands-btn"
                      onClick={() => viewFriendBrands(friend._id)}
                    >
                      View Brands
                    </button>
                    <button 
                      className="remove-friend-btn"
                      onClick={() => removeFriend(friend._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="requests-tab">
          <div className="requests-section">
            <h3>Pending Requests ({pendingRequests.length})</h3>
            {pendingRequests.length === 0 ? (
              <p className="no-requests">No pending friend requests</p>
            ) : (
              <div className="requests-grid">
                {pendingRequests.map(request => (
                  <div key={request._id} className="request-card">
                    <div className="request-info">
                      <h4>{request.firstName} {request.lastName}</h4>
                      <p>{request.email}</p>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => acceptFriendRequest(request._id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => rejectFriendRequest(request._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="requests-section">
            <h3>Sent Requests ({sentRequests.length})</h3>
            {sentRequests.length === 0 ? (
              <p className="no-requests">No sent friend requests</p>
            ) : (
              <div className="requests-grid">
                {sentRequests.map(request => (
                  <div key={request._id} className="request-card">
                    <div className="request-info">
                      <h4>{request.firstName} {request.lastName}</h4>
                      <p>{request.email}</p>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => cancelFriendRequest(request._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="search-tab">
          <div className="search-section">
            <h3>Find Friends</h3>
            <div className="search-input">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results</h4>
              <div className="search-results-grid">
                {searchResults.map(user => (
                  <div key={user._id} className="search-result-card">
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="send-request-btn"
                        onClick={() => sendFriendRequest(user._id)}
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedFriend && (
        <div className="chat-modal">
          <div className="chat-content">
            <div className="chat-header">
              <div className="chat-friend-info">
                <div className="friend-avatar">
                  {selectedFriend.profilePicture ? (
                    <img src={selectedFriend.profilePicture} alt={`${selectedFriend.firstName} ${selectedFriend.lastName}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedFriend.firstName.charAt(0)}{selectedFriend.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{selectedFriend.firstName} {selectedFriend.lastName}</h3>
                  <p>{selectedFriend.email}</p>
                </div>
              </div>
              <div className="chat-actions">
                <button 
                  className="brand-question-btn"
                  onClick={() => setShowBrandQuestion(true)}
                >
                  Ask About Brands
                </button>
                <button 
                  className="close-chat-btn"
                  onClick={() => setShowChat(false)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      {message.messageType === 'brand_question' && (
                        <div className="brand-question-indicator">
                          🏷️ Brand Question
                        </div>
                      )}
                      <p>{message.content}</p>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Question Modal */}
      {showBrandQuestion && selectedFriend && (
        <div className="brand-question-modal">
          <div className="brand-question-content">
            <h3>Ask about {selectedFriend.firstName}'s brands</h3>
            <div className="brand-selection">
              <label>Select a brand:</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Choose a brand...</option>
                {selectedFriend.favoriteBrands && selectedFriend.favoriteBrands.map(brand => (
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

      {/* Friend Brands Modal */}
      {showFriendBrands && friendBrandsData && (
        <div className="friend-brands-modal">
          <div className="friend-brands-content">
            <div className="friend-brands-header">
              <h3>{friendBrandsData.firstName} {friendBrandsData.lastName}'s Favorite Brands</h3>
              <button 
                className="close-friend-brands-btn"
                onClick={() => {
                  setShowFriendBrands(false);
                  setFriendBrandsData(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="friend-brands-grid">
              {friendBrandsData.favoriteBrands && friendBrandsData.favoriteBrands.length > 0 ? (
                friendBrandsData.favoriteBrands.map((brandKey) => (
                  <div key={brandKey} className="friend-brand-card">
                    <div className="brand-logo">
                      <img 
                        src={`/images/brands/${brandKey}-logo.png`} 
                        alt={`${brandKey} logo`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="brand-placeholder" style={{ display: 'none' }}>
                        {brandKey.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="brand-info">
                      <h4>{getBrandName(brandKey)}</h4>
                      <div className="brand-actions">
                        <a
                          href={getBrandUrl(brandKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="brand-link"
                        >
                          Visit Store
                        </a>
                        <button
                          className="chat-brand-btn"
                          onClick={() => {
                            setShowFriendBrands(false);
                            setFriendBrandsData(null);
                            // Switch to chats tab and open chat with this friend
                            if (onSwitchToChats) {
                              onSwitchToChats(friendBrandsData.id);
                            }
                          }}
                        >
                          Chat about this brand with {friendBrandsData.firstName}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-brands-message">
                  <p>No favorite brands yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendManager; 