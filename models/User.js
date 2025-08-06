const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  profilePicture: {
    type: String,
    default: null // URL to profile picture
  },
  styleImages: [{
    url: String,
    source: {
      type: String,
      enum: ['upload', 'pinterest'],
      default: 'upload'
    },
    pinterestData: {
      pinId: String,
      boardName: String,
      description: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  styleProfile: {
    detectedStyles: [String],
    colors: [String],
    patterns: [String],
    occasions: [String],
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    lastAnalyzed: Date
  },
  favoriteBrands: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10; // Maximum 10 favorite brands
      },
      message: 'Cannot have more than 10 favorite brands'
    }
  },
  
  // Newly Discovered Brands Feature
  newlyDiscoveredBrands: [{
    brandId: {
      type: String,
      required: true
    },
    discoveredAt: {
      type: Date,
      default: Date.now
    },
    discoveryMonth: {
      type: String, // Format: "2024-01"
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'viewed', 'liked', 'added_to_favorites'],
      default: 'new'
    },
    discoveryReason: {
      type: String, // Why this brand was suggested
      maxlength: 200
    },
    trending: {
      type: Boolean,
      default: false
    }
  }],
  
  lastDiscoveryUpdate: {
    type: Date,
    default: null
  },
  
  discoveryPreferences: {
    enableMonthlyDiscovery: {
      type: Boolean,
      default: true
    },
    preferredDiscoveryTypes: [{
      type: String,
      enum: ['trending', 'similar_style', 'emerging', 'sustainable', 'luxury', 'affordable']
    }],
    discoveryNotifications: {
      type: Boolean,
      default: true
    }
  },

  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Friend-related fields
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Friend requests sent by this user
  sentFriendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Friend requests received by this user
  receivedFriendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Privacy settings
  privacySettings: {
    showBrandsToFriends: {
      type: Boolean,
      default: true
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update favorite brands
userSchema.methods.updateFavoriteBrands = function(brands) {
  if (brands.length > 10) {
    throw new Error('Cannot have more than 10 favorite brands');
  }
  this.favoriteBrands = brands;
  return this.save();
};

// Method to add a favorite brand
userSchema.methods.addFavoriteBrand = function(brandKey) {
  if (this.favoriteBrands.length >= 10) {
    throw new Error('Cannot add more than 10 favorite brands');
  }
  if (!this.favoriteBrands.includes(brandKey)) {
    this.favoriteBrands.push(brandKey);
  }
  return this.save();
};

// Method to remove a favorite brand
userSchema.methods.removeFavoriteBrand = function(brandKey) {
  this.favoriteBrands = this.favoriteBrands.filter(brand => brand !== brandKey);
  return this.save();
};

// Friend-related methods
userSchema.methods.sendFriendRequest = function(targetUserId) {
  if (this.sentFriendRequests.includes(targetUserId)) {
    throw new Error('Friend request already sent');
  }
  if (this.friends.includes(targetUserId)) {
    throw new Error('Already friends');
  }
  this.sentFriendRequests.push(targetUserId);
  return this.save();
};

userSchema.methods.acceptFriendRequest = function(fromUserId) {
  if (!this.receivedFriendRequests.includes(fromUserId)) {
    throw new Error('No friend request from this user');
  }
  
  // Remove from received requests
  this.receivedFriendRequests = this.receivedFriendRequests.filter(id => id.toString() !== fromUserId.toString());
  
  // Add to friends
  if (!this.friends.includes(fromUserId)) {
    this.friends.push(fromUserId);
  }
  
  return this.save();
};

userSchema.methods.rejectFriendRequest = function(fromUserId) {
  this.receivedFriendRequests = this.receivedFriendRequests.filter(id => id.toString() !== fromUserId.toString());
  return this.save();
};

userSchema.methods.cancelFriendRequest = function(toUserId) {
  this.sentFriendRequests = this.sentFriendRequests.filter(id => id.toString() !== toUserId.toString());
  return this.save();
};

userSchema.methods.removeFriend = function(friendUserId) {
  this.friends = this.friends.filter(id => id.toString() !== friendUserId.toString());
  return this.save();
};

userSchema.methods.getFriendsList = function() {
  console.log('🔍 Getting friends list for user:', this._id);
  console.log('👥 Friends array:', this.friends);
  return this.model('User').find({
    _id: { $in: this.friends }
  }).select('firstName lastName email favoriteBrands privacySettings profilePicture');
};

userSchema.methods.getPendingRequests = function() {
  console.log('🔍 Getting pending requests for user:', this._id);
  console.log('📥 Received requests array:', this.receivedFriendRequests);
  return this.model('User').find({
    _id: { $in: this.receivedFriendRequests }
  }).select('firstName lastName email profilePicture');
};

userSchema.methods.getSentRequests = function() {
  console.log('🔍 Getting sent requests for user:', this._id);
  console.log('📤 Sent requests array:', this.sentFriendRequests);
  return this.model('User').find({
    _id: { $in: this.sentFriendRequests }
  }).select('firstName lastName email profilePicture');
};

module.exports = mongoose.model('User', userSchema); 