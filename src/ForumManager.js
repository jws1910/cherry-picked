import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ForumManager.css';

const ForumManager = ({ user, onUpdateUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    imageUrl: '',
    items: [],
    tags: [],
    privacy: 'public' // 'public', 'friends', 'private'
  });
  const [newItem, setNewItem] = useState({
    brandName: '',
    itemName: '',
    itemUrl: '',
    price: ''
  });
  const [newComment, setNewComment] = useState('');
  const [commentingPost, setCommentingPost] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    
    try {
      let endpoint;
      if (activeTab === 'my-posts') {
        endpoint = '/api/forum/posts/my';
      } else if (activeTab === 'feed') {
        endpoint = '/api/forum/posts/public';
      } else if (activeTab === 'friends') {
        endpoint = '/api/forum/posts/friends';
      } else {
        endpoint = '/api/forum/posts';
      }
      
      const response = await axios.get(`http://localhost:3001${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.description || !newPost.imageUrl) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/forum/posts', newPost, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(prev => [response.data.post, ...prev]);
        setShowCreatePost(false);
        setNewPost({
          title: '',
          description: '',
          imageUrl: '',
          items: [],
          tags: [],
          privacy: 'public'
        });
        setError('');
      } else {
        setError('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  const handleAddItem = () => {
    if (!newItem.brandName || !newItem.itemName || !newItem.itemUrl) {
      setError('Please fill in all item fields');
      return;
    }

    setNewPost(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }));
    setNewItem({
      brandName: '',
      itemName: '',
      itemUrl: '',
      price: ''
    });
    setError('');
  };

  const handleRemoveItem = (index) => {
    setNewPost(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = (tag) => {
    if (tag.trim() && !newPost.tags.includes(tag.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/forum/posts/${postId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: response.data.likes }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`http://localhost:3001/api/forum/posts/${postId}/comments`, {
        content: newComment.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        ));
        setNewComment('');
        setCommentingPost(null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await axios.delete(`http://localhost:3001/api/forum/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const isLikedByUser = (post) => {
    return post.likes.some(like => like.id === user.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="forum-manager-container">
        <div className="no-user-message">
          <p>Please log in to access the forum</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-manager-container">
      <div className="forum-header">
        <h2>Fashion Forum</h2>
        <p>Share your recent fits publicly or privately</p>
      </div>

      <div className="forum-tabs">
        <button 
          className={`forum-tab-button ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Public Feed
        </button>
        <button 
          className={`forum-tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button 
          className={`forum-tab-button ${activeTab === 'my-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-posts')}
        >
          My Posts
        </button>
        <button 
          className="create-post-btn"
          onClick={() => setShowCreatePost(true)}
        >
          + Share Fit
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet</p>
          <p className="subtext">Be the first to share your fit!</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    <span className="avatar-placeholder">
                      {post.author.firstName.charAt(0)}
                    </span>
                  </div>
                                  <div className="author-info">
                  <h4>{post.author.firstName} {post.author.lastName}</h4>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                  {post.privacy === 'friends' && (
                    <span className="privacy-indicator">
                      <span className="privacy-icon">👥</span>
                      Friends Only
                    </span>
                  )}
                  {post.privacy === 'private' && (
                    <span className="privacy-indicator">
                      <span className="privacy-icon">🔒</span>
                      Private
                    </span>
                  )}
                </div>
                </div>
                {post.author.id === user.id && (
                  <button 
                    className="delete-post-btn"
                    onClick={() => handleDeletePost(post.id)}
                    title="Delete post"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                
                {post.imageUrl && (
                  <div className="post-image">
                    <img src={post.imageUrl} alt="Fit" />
                  </div>
                )}

                {post.items && post.items.length > 0 && (
                  <div className="post-items">
                    <h4>Items in this fit:</h4>
                    {post.items.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-info">
                          <h5>{item.brandName}</h5>
                          <p>{item.itemName}</p>
                          {item.price && <span className="item-price">{item.price}</span>}
                        </div>
                        <a 
                          href={item.itemUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="item-link"
                        >
                          View Item
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button 
                  className={`like-btn ${isLikedByUser(post) ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  ❤️ {post.likes.length}
                </button>
                <button 
                  className="comment-btn"
                  onClick={() => setCommentingPost(commentingPost === post.id ? null : post.id)}
                >
                  💬 {post.comments.length}
                </button>
              </div>

              {commentingPost === post.id && (
                <div className="comment-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="2"
                  />
                  <button onClick={() => handleComment(post.id)}>Post</button>
                </div>
              )}

              {post.comments.length > 0 && (
                <div className="comments-section">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-author">
                        <span className="author-name">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="comment-date">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="create-post-modal">
          <div className="create-post-content">
            <div className="modal-header">
              <div className="modal-title">
                <h3>Share Your Fit</h3>
                <span className="privacy-status">
                  {newPost.privacy === 'public' && (
                    <span className="public-status">
                      <span className="privacy-icon">🌍</span>
                      Public
                    </span>
                  )}
                  {newPost.privacy === 'friends' && (
                    <span className="friends-status">
                      <span className="privacy-icon">👥</span>
                      Friends Only
                    </span>
                  )}
                  {newPost.privacy === 'private' && (
                    <span className="private-status">
                      <span className="privacy-icon">🔒</span>
                      Private
                    </span>
                  )}
                </span>
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCreatePost(false)}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your fit a title..."
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your fit..."
                rows="4"
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label>Image URL *</label>
              <input
                type="url"
                value={newPost.imageUrl}
                onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label>Items in this fit</label>
              <div className="items-section">
                {newPost.items.map((item, index) => (
                  <div key={index} className="item-preview">
                    <div className="item-details">
                      <strong>{item.brandName}</strong> - {item.itemName}
                      {item.price && <span className="price">${item.price}</span>}
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div className="add-item-form">
                  <input
                    type="text"
                    value={newItem.brandName}
                    onChange={(e) => setNewItem(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Brand name"
                  />
                  <input
                    type="text"
                    value={newItem.itemName}
                    onChange={(e) => setNewItem(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="Item name"
                  />
                  <input
                    type="url"
                    value={newItem.itemUrl}
                    onChange={(e) => setNewItem(prev => ({ ...prev, itemUrl: e.target.value }))}
                    placeholder="Item URL"
                  />
                  <input
                    type="text"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Price (optional)"
                  />
                  <button onClick={handleAddItem}>Add Item</button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-section">
                {newPost.tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Privacy Setting</label>
              <div className="privacy-toggle">
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={newPost.privacy === 'public'}
                    onChange={() => setNewPost(prev => ({ ...prev, privacy: 'public' }))}
                  />
                  <span className="privacy-label">
                    <span className="privacy-icon">🌍</span>
                    Public - Visible to everyone
                  </span>
                </label>
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="friends"
                    checked={newPost.privacy === 'friends'}
                    onChange={() => setNewPost(prev => ({ ...prev, privacy: 'friends' }))}
                  />
                  <span className="privacy-label">
                    <span className="privacy-icon">👥</span>
                    Friends Only - Visible to your friends
                  </span>
                </label>
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={newPost.privacy === 'private'}
                    onChange={() => setNewPost(prev => ({ ...prev, privacy: 'private' }))}
                  />
                  <span className="privacy-label">
                    <span className="privacy-icon">🔒</span>
                    Private - Only visible to you
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCreatePost}>Share Fit</button>
              <button onClick={() => setShowCreatePost(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumManager; 