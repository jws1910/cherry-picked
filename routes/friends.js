const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get user's friends list and requests
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Getting friends data for user:', req.user.userId);
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('📋 Getting friends list...');
    const friends = await user.getFriendsList();
    console.log('📋 Getting pending requests...');
    const pendingRequests = await user.getPendingRequests();
    console.log('📋 Getting sent requests...');
    const sentRequests = await user.getSentRequests();
    
    console.log('📊 Raw friends data:', friends);
    console.log('📊 Raw pending requests data:', pendingRequests);
    console.log('📊 Raw sent requests data:', sentRequests);
    
    console.log('✅ Friends count:', friends.length);
    console.log('✅ Pending requests count:', pendingRequests.length);
    console.log('✅ Sent requests count:', sentRequests.length);
    
    res.json({
      success: true,
      friends: friends.map(friend => ({
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        profilePicture: friend.profilePicture,
        favoriteBrands: friend.privacySettings?.showBrandsToFriends ? friend.favoriteBrands : [],
        showBrands: friend.privacySettings?.showBrandsToFriends || false
      })),
      pendingRequests: pendingRequests.map(request => ({
        _id: request._id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email
      })),
      sentRequests: sentRequests.map(request => ({
        _id: request._id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email
      }))
    });
  } catch (error) {
    console.error('❌ Error getting friends data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get pending friend requests
router.get('/requests/pending', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pendingRequests = await user.getPendingRequests();
    
    res.json({
      success: true,
      requests: pendingRequests.map(request => ({
        _id: request._id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email
      }))
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get sent friend requests
router.get('/requests/sent', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sentRequests = await user.getSentRequests();
    
    res.json({
      success: true,
      requests: sentRequests.map(request => ({
        _id: request._id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email
      }))
    });
  } catch (error) {
    console.error('Error getting sent requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Send friend request
router.post('/request/send', async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user.userId;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if target user allows friend requests
    if (!targetUser.privacySettings?.allowFriendRequests) {
      return res.status(403).json({
        success: false,
        message: 'This user does not accept friend requests'
      });
    }

    await user.sendFriendRequest(targetUserId);
    
    // Add to target user's received requests
    if (!targetUser.receivedFriendRequests.includes(userId)) {
      targetUser.receivedFriendRequests.push(userId);
      await targetUser.save();
    }

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
});

// Accept friend request
router.post('/request/accept', async (req, res) => {
  try {
    const { fromUserId } = req.body;
    const userId = req.user.userId;
    
    if (!fromUserId) {
      return res.status(400).json({
        success: false,
        message: 'From user ID is required'
      });
    }

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);
    
    if (!user || !fromUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.acceptFriendRequest(fromUserId);
    
    // Add current user to fromUser's friends list
    if (!fromUser.friends.includes(userId)) {
      fromUser.friends.push(userId);
    }
    
    // Remove from fromUser's sent requests
    fromUser.sentFriendRequests = fromUser.sentFriendRequests.filter(id => id.toString() !== userId.toString());
    
    await fromUser.save();

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
});

// Reject friend request
router.post('/request/reject', async (req, res) => {
  try {
    const { fromUserId } = req.body;
    const userId = req.user.userId;
    
    if (!fromUserId) {
      return res.status(400).json({
        success: false,
        message: 'From user ID is required'
      });
    }

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);
    
    if (!user || !fromUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.rejectFriendRequest(fromUserId);
    
    // Remove from fromUser's sent requests
    fromUser.sentFriendRequests = fromUser.sentFriendRequests.filter(id => id.toString() !== userId.toString());
    await fromUser.save();

    res.json({
      success: true,
      message: 'Friend request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
});

// Cancel friend request
router.post('/request/cancel', async (req, res) => {
  try {
    const { toUserId } = req.body;
    const userId = req.user.userId;
    
    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: 'To user ID is required'
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(toUserId);
    
    if (!user || !toUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.cancelFriendRequest(toUserId);
    
    // Remove from toUser's received requests
    toUser.receivedFriendRequests = toUser.receivedFriendRequests.filter(id => id.toString() !== userId.toString());
    await toUser.save();

    res.json({
      success: true,
      message: 'Friend request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
});

// Remove friend
router.post('/remove', async (req, res) => {
  try {
    const { friendUserId } = req.body;
    const userId = req.user.userId;
    
    if (!friendUserId) {
      return res.status(400).json({
        success: false,
        message: 'Friend user ID is required'
      });
    }

    const user = await User.findById(userId);
    const friendUser = await User.findById(friendUserId);
    
    if (!user || !friendUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.removeFriend(friendUserId);
    
    // Remove current user from friend's friends list
    friendUser.friends = friendUser.friends.filter(id => id.toString() !== userId.toString());
    await friendUser.save();

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
});

// Get friend's brands
router.get('/friend/:friendId/brands', async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    
    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if they are friends
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view brands of your friends'
      });
    }

    // Check if friend allows showing brands
    if (!friend.privacySettings?.showBrandsToFriends) {
      return res.status(403).json({
        success: false,
        message: 'This friend has hidden their brands'
      });
    }

    res.json({
      success: true,
      friend: {
        id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        favoriteBrands: friend.favoriteBrands
      }
    });
  } catch (error) {
    console.error('Error getting friend brands:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Update privacy settings
router.put('/privacy', async (req, res) => {
  try {
    const { showBrandsToFriends, allowFriendRequests } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (showBrandsToFriends !== undefined) {
      user.privacySettings.showBrandsToFriends = showBrandsToFriends;
    }
    
    if (allowFriendRequests !== undefined) {
      user.privacySettings.allowFriendRequests = allowFriendRequests;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Search users by email or name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.userId;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Search for users by email or name
    const searchResults = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { email: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('firstName lastName email profilePicture');

    // Add relationship status to each result
    const resultsWithStatus = searchResults.map(result => {
      const isFriend = user.friends.includes(result._id);
      const hasSentRequest = user.sentFriendRequests.includes(result._id);
      const hasReceivedRequest = user.receivedFriendRequests.includes(result._id);
      
      let status = 'none';
      if (isFriend) status = 'friend';
      else if (hasSentRequest) status = 'sent';
      else if (hasReceivedRequest) status = 'received';

      return {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        profilePicture: result.profilePicture,
        status
      };
    });

    res.json({
      success: true,
      users: resultsWithStatus
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router; 