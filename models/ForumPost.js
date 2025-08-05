const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const forumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    required: true
  },
  items: [{
    brandName: {
      type: String,
      required: true,
      trim: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    itemUrl: {
      type: String,
      required: true
    },
    price: {
      type: String,
      default: 'N/A'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
forumPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ isPublic: 1, createdAt: -1 });

// Method to add a comment
forumPostSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content.trim()
  });
  return this.save();
};

// Method to toggle like
forumPostSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to get posts for a user (including friends' posts)
forumPostSchema.statics.getPostsForUser = async function(userId, page = 1, limit = 10) {
  // Get user's friends list
  const user = await User.findById(userId).select('friends');
  const friendIds = user ? user.friends : [];
  
  return this.find({
    $or: [
      { author: userId }, // User's own posts (all privacy levels)
      { privacy: 'public' }, // Public posts from others
      { privacy: 'friends', author: { $in: friendIds } } // Friends-only posts from friends
    ]
  })
  .populate('author', 'firstName lastName email profilePicture')
  .populate('comments.author', 'firstName lastName profilePicture')
  .populate('likes', 'firstName lastName')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Static method to get user's own posts
forumPostSchema.statics.getUserPosts = function(userId) {
  return this.find({ author: userId })
  .populate('author', 'firstName lastName email profilePicture')
  .populate('comments.author', 'firstName lastName profilePicture')
  .populate('likes', 'firstName lastName')
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('ForumPost', forumPostSchema); 