const express = require('express');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const router = express.Router();

// Get all posts for the current user (including friends' posts)
router.get('/posts', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await ForumPost.getPostsForUser(userId, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        items: post.items,
        tags: post.tags,
        likes: post.likes.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        })),
        comments: post.comments.map(comment => ({
          id: comment._id,
          author: {
            id: comment.author._id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profilePicture: comment.author.profilePicture
          },
          content: comment.content,
          createdAt: comment.createdAt
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting forum posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get only public posts (for public feed)
router.get('/posts/public', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await ForumPost.find({ privacy: 'public' })
      .populate('author', 'firstName lastName email profilePicture')
      .populate('comments.author', 'firstName lastName profilePicture')
      .populate('likes', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        items: post.items,
        tags: post.tags,
        likes: post.likes.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        })),
        comments: post.comments.map(comment => ({
          id: comment._id,
          author: {
            id: comment.author._id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profilePicture: comment.author.profilePicture
          },
          content: comment.content,
          createdAt: comment.createdAt
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting public forum posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get friends-only posts
router.get('/posts/friends', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    
    // Get user's friends list
    const user = await User.findById(userId).select('friends');
    const friendIds = user ? user.friends : [];
    
    const posts = await ForumPost.find({
      $or: [
        { author: userId, privacy: 'friends' }, // User's own friends-only posts
        { privacy: 'friends', author: { $in: friendIds } } // Friends-only posts from friends
      ]
    })
    .populate('author', 'firstName lastName email profilePicture')
    .populate('comments.author', 'firstName lastName profilePicture')
    .populate('likes', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        items: post.items,
        tags: post.tags,
        likes: post.likes.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        })),
        comments: post.comments.map(comment => ({
          id: comment._id,
          author: {
            id: comment.author._id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profilePicture: comment.author.profilePicture
          },
          content: comment.content,
          createdAt: comment.createdAt
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting friends forum posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get user's own posts
router.get('/posts/my', async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await ForumPost.getUserPosts(userId);
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        items: post.items,
        tags: post.tags,
        likes: post.likes.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        })),
        comments: post.comments.map(comment => ({
          id: comment._id,
          author: {
            id: comment.author._id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profilePicture: comment.author.profilePicture
          },
          content: comment.content,
          createdAt: comment.createdAt
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Create a new forum post
router.post('/posts', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, imageUrl, items, tags, privacy = 'public', brandKey } = req.body;
    
    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and image URL are required'
      });
    }
    
    const post = new ForumPost({
      author: userId,
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      brandKey: brandKey || null,
      items: items || [],
      tags: tags || [],
      privacy
    });
    
    await post.save();
    await post.populate('author', 'firstName lastName email profilePicture');
    
    res.json({
      success: true,
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        brandKey: post.brandKey,
        items: post.items,
        tags: post.tags,
        likes: [],
        comments: [],
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Add a comment to a post
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    await post.addComment(userId, content);
    await post.populate('comments.author', 'firstName lastName profilePicture');
    
    const newComment = post.comments[post.comments.length - 1];
    
    res.json({
      success: true,
      comment: {
        id: newComment._id,
        author: {
          id: newComment.author._id,
          firstName: newComment.author.firstName,
          lastName: newComment.author.lastName,
          profilePicture: newComment.author.profilePicture
        },
        content: newComment.content,
        createdAt: newComment.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Toggle like on a post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    await post.toggleLike(userId);
    await post.populate('likes', 'firstName lastName');
    
    res.json({
      success: true,
      likes: post.likes.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      }))
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Update a post (only by author)
router.put('/posts/:postId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { title, description, imageUrl, items, tags, privacy } = req.body;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }
    
    // Update the post
    post.title = title || post.title;
    post.description = description || post.description;
    post.imageUrl = imageUrl || post.imageUrl;
    post.items = items || post.items;
    post.tags = tags || post.tags;
    post.privacy = privacy || post.privacy;
    post.updatedAt = new Date();
    
    await post.save();
    await post.populate('author', 'firstName lastName email profilePicture');
    
    res.json({
      success: true,
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        brandKey: post.brandKey,
        items: post.items,
        tags: post.tags,
        likes: [],
        comments: [],
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Delete a post (only by author)
router.delete('/posts/:postId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }
    
    await ForumPost.findByIdAndDelete(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get brand-specific forum posts
router.get('/brands/:brandKey/posts', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { brandKey } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await ForumPost.getBrandPostsForUser(brandKey, userId, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
          profilePicture: post.author.profilePicture
        },
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        brandKey: post.brandKey,
        items: post.items,
        tags: post.tags,
        likes: post.likes.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        })),
        comments: post.comments.map(comment => ({
          id: comment._id,
          author: {
            id: comment.author._id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profilePicture: comment.author.profilePicture
          },
          content: comment.content,
          createdAt: comment.createdAt
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting brand forum posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router; 