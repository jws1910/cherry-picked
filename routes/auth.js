const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    await user.save();
    console.log('User registered successfully:', user.email);

    // Get unread notifications count (will be 0 for new users)
    const unreadNotificationsCount = await Notification.getUnreadCount(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        favoriteBrands: user.favoriteBrands,
        privacySettings: user.privacySettings,
        friendsCount: user.friends.length,
        pendingRequestsCount: user.receivedFriendRequests.length,
        unreadNotificationsCount,
        isFirstLogin: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again.'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if this is the first login (no previous lastLogin or lastLogin is the same as createdAt)
    const isFirstLogin = !user.lastLogin || 
      user.lastLogin.getTime() === user.createdAt.getTime() ||
      user.lastLogin.getTime() === new Date(user.createdAt).getTime();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get unread notifications count
    const unreadNotificationsCount = await Notification.getUnreadCount(user._id);

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        favoriteBrands: user.favoriteBrands,
        privacySettings: user.privacySettings,
        friendsCount: user.friends.length,
        pendingRequestsCount: user.receivedFriendRequests.length,
        unreadNotificationsCount,
        isFirstLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get unread notifications count
    const unreadNotificationsCount = await Notification.getUnreadCount(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        favoriteBrands: user.favoriteBrands,
        privacySettings: user.privacySettings,
        friendsCount: user.friends.length,
        pendingRequestsCount: user.receivedFriendRequests.length,
        unreadNotificationsCount,
        isFirstLogin: false // Profile endpoint is for existing users
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Save favorite brands
router.post('/favorite-brands', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { favoriteBrands } = req.body;

    // Validate input
    if (!Array.isArray(favoriteBrands)) {
      return res.status(400).json({
        success: false,
        message: 'favoriteBrands must be an array'
      });
    }

    if (favoriteBrands.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have more than 10 favorite brands'
      });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.favoriteBrands = favoriteBrands;
    await user.save();

    res.json({
      success: true,
      message: 'Favorite brands updated successfully',
      favoriteBrands: user.favoriteBrands
    });
  } catch (error) {
    console.error('Save favorite brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get favorite brands
router.get('/favorite-brands', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      favoriteBrands: user.favoriteBrands
    });
  } catch (error) {
    console.error('Get favorite brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router; 