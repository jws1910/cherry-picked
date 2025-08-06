import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BrandForum.css';

const BrandForum = ({ brandKey, brandName, user, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    imageUrl: '',
    items: [],
    tags: [],
    privacy: 'public'
  });
  const [newItem, setNewItem] = useState({
    brandName: brandName || '',
    itemName: '',
    itemUrl: '',
    price: ''
  });
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    loadPosts();
  }, [brandKey]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/forum/brands/${brandKey}/posts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setError('Failed to load brand forum posts');
      }
    } catch (error) {
      console.error('Error loading brand forum posts:', error);
      setError('Error loading brand forum posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.title.trim() || !newPost.description.trim() || !newPost.imageUrl.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      const authToken = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/forum/posts', {
        ...newPost,
        brandKey: brandKey,
        items: newPost.items
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPosts(prev => [response.data.post, ...prev]);
        setNewPost({
          title: '',
          description: '',
          imageUrl: '',
          items: [],
          tags: [],
          privacy: 'public'
        });
        setShowCreatePost(false);
        alert('Post created successfully!');
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  const handleAddItem = () => {
    if (newItem.itemName.trim()) {
      setNewPost(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem }]
      }));
      setNewItem({
        brandName: brandName || '',
        itemName: '',
        itemUrl: '',
        price: ''
      });
    }
  };

  const handleRemoveItem = (index) => {
    setNewPost(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleLike = async (postId) => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/forum/posts/${postId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? response.data.post : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    try {
      const content = newComment[postId];
      if (!content?.trim()) return;

      const authToken = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/forum/posts/${postId}/comments`, {
        content: content.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? response.data.post : post
        ));
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="brand-forum-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading {brandName} forum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-forum-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadPosts}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-forum-container">
      <div className="brand-forum-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="brand-forum-title">
          <h2>{brandName} Forum</h2>
          <p>Share your {brandName} purchases, sizing tips, and style inspiration</p>
        </div>
        <button className="create-post-btn" onClick={() => setShowCreatePost(true)}>
          + Share Your {brandName} Find
        </button>
      </div>

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet for {brandName}. Be the first to share!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author.profilePicture ? (
                      <img src={post.author.profilePicture} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder">
                        {post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <h4>{post.author.firstName} {post.author.lastName}</h4>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                    {post.privacy === 'friends' && (
                      <span className="privacy-indicator">
                        <span className="privacy-icon">👥</span> Friends Only
                      </span>
                    )}
                    {post.privacy === 'private' && (
                      <span className="privacy-indicator">
                        <span className="privacy-icon">🔒</span> Private
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                {post.imageUrl && (
                  <div className="post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}

                {post.items && post.items.length > 0 && (
                  <div className="post-items">
                    <h4>Items Featured:</h4>
                    {post.items.map((item, index) => (
                      <div key={index} className="item-link">
                        <span className="item-brand">{item.brandName}</span>
                        <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
                          {item.itemName}
                        </a>
                        {item.price && <span className="item-price">{item.price}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button 
                  className={`like-btn ${post.likes.some(like => like.id === user.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  ❤️ {post.likes.length}
                </button>
                <span className="comment-count">💬 {post.comments.length}</span>
              </div>

              <div className="comments-section">
                {post.comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-author">
                      <div className="comment-avatar">
                        {comment.author.profilePicture ? (
                          <img src={comment.author.profilePicture} alt="Profile" />
                        ) : (
                          <div className="avatar-placeholder">
                            {comment.author.firstName?.charAt(0)}{comment.author.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="comment-info">
                        <span className="comment-author-name">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}

                <div className="add-comment">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                  />
                  <button onClick={() => handleComment(post.id)}>Post</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="create-post-modal">
          <div className="create-post-content">
            <div className="modal-header">
              <h3>Share Your {brandName} Find</h3>
              <button className="close-modal-btn" onClick={() => setShowCreatePost(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What did you get from this brand?"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Share details about fit, quality, styling tips..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={newPost.imageUrl}
                onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
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
                  <span className="privacy-label">🌍 Public</span>
                </label>
                <label className="privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="friends"
                    checked={newPost.privacy === 'friends'}
                    onChange={() => setNewPost(prev => ({ ...prev, privacy: 'friends' }))}
                  />
                  <span className="privacy-label">👥 Friends Only</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Add Item Details (Optional)</label>
              <div className="item-inputs">
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
                  placeholder="Price"
                />
                <button type="button" onClick={handleAddItem} className="add-item-btn">Add Item</button>
              </div>

              {newPost.items.length > 0 && (
                <div className="added-items">
                  <h4>Added Items:</h4>
                  {newPost.items.map((item, index) => (
                    <div key={index} className="added-item">
                      <span>{item.itemName} - {item.price}</span>
                      <button onClick={() => handleRemoveItem(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowCreatePost(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreatePost} className="create-btn">Share Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandForum; 