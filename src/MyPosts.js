import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyPosts.css';

const MyPosts = ({ user, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    items: [],
    tags: [],
    privacy: 'public'
  });

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/forum/posts/my', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setError('Failed to load your posts');
      }
    } catch (error) {
      console.error('Error loading my posts:', error);
      setError('Error loading your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditForm({
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      items: post.items || [],
      tags: post.tags || [],
      privacy: post.privacy || 'public'
    });
  };

  const handleSaveEdit = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/api/forum/posts/${editingPost}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the post in the local state
        setPosts(prev => prev.map(post => 
          post.id === editingPost ? { ...post, ...editForm } : post
        ));
        setEditingPost(null);
        setEditForm({
          title: '',
          description: '',
          imageUrl: '',
          items: [],
          tags: [],
          privacy: 'public'
        });
      } else {
        alert('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3001/api/forum/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getBrandName = (post) => {
    if (post.brandKey) {
      // Try to get brand name from brands config
      return `${post.brandKey.charAt(0).toUpperCase() + post.brandKey.slice(1)} Forum`;
    }
    return 'Fashion Forum';
  };

  if (loading) {
    return (
      <div className="my-posts-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-posts-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadMyPosts}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <div className="my-posts-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="my-posts-title">
          <h2>My Posts</h2>
          <p>Manage all your posts from fashion forums and brand communities</p>
        </div>
        <div className="posts-count">
          {posts.length} Posts
        </div>
      </div>

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>You haven't posted anything yet. Share your first fit or find!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-meta">
                  <div className="forum-badge">
                    {getBrandName(post)}
                  </div>
                  <div className="post-date">{formatDate(post.createdAt)}</div>
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
                <div className="post-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditPost(post)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {editingPost === post.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Privacy Setting</label>
                    <div className="privacy-toggle">
                      <label className="privacy-option">
                        <input
                          type="radio"
                          name={`privacy-${post.id}`}
                          value="public"
                          checked={editForm.privacy === 'public'}
                          onChange={() => setEditForm(prev => ({ ...prev, privacy: 'public' }))}
                        />
                        <span className="privacy-label">🌍 Public</span>
                      </label>
                      <label className="privacy-option">
                        <input
                          type="radio"
                          name={`privacy-${post.id}`}
                          value="friends"
                          checked={editForm.privacy === 'friends'}
                          onChange={() => setEditForm(prev => ({ ...prev, privacy: 'friends' }))}
                        />
                        <span className="privacy-label">👥 Friends Only</span>
                      </label>
                      <label className="privacy-option">
                        <input
                          type="radio"
                          name={`privacy-${post.id}`}
                          value="private"
                          checked={editForm.privacy === 'private'}
                          onChange={() => setEditForm(prev => ({ ...prev, privacy: 'private' }))}
                        />
                        <span className="privacy-label">🔒 Private</span>
                      </label>
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setEditingPost(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
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

                  <div className="post-stats">
                    <span className="stat">❤️ {post.likes?.length || 0} likes</span>
                    <span className="stat">💬 {post.comments?.length || 0} comments</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPosts; 