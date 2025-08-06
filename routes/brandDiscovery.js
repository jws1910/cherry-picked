const express = require('express');
const router = express.Router();
const brandDiscoveryService = require('../services/brandDiscoveryService');

// Get user's current monthly discoveries
router.get('/current', async (req, res) => {
  try {
    const discoveries = await brandDiscoveryService.getUserDiscoveries(req.user.id, false);
    res.json({
      success: true,
      discoveries,
      count: discoveries.length
    });
  } catch (error) {
    console.error('Error getting current discoveries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get discoveries' 
    });
  }
});

// Get user's discovery history
router.get('/history', async (req, res) => {
  try {
    const discoveries = await brandDiscoveryService.getUserDiscoveries(req.user.id, true);
    
    // Group by month
    const groupedByMonth = discoveries.reduce((acc, discovery) => {
      const month = discovery.discoveryMonth;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(discovery);
      return acc;
    }, {});

    res.json({
      success: true,
      history: groupedByMonth,
      totalDiscoveries: discoveries.length
    });
  } catch (error) {
    console.error('Error getting discovery history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get discovery history' 
    });
  }
});

// Trigger discovery generation for current user
router.post('/generate', async (req, res) => {
  try {
    const discoveries = await brandDiscoveryService.generateMonthlyDiscoveries(req.user.id);
    
    if (!discoveries) {
      return res.json({
        success: false,
        message: 'Discovery generation disabled or already complete for this month'
      });
    }

    res.json({
      success: true,
      message: `Generated ${discoveries.length} new discoveries`,
      discoveries
    });
  } catch (error) {
    console.error('Error generating discoveries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate discoveries' 
    });
  }
});

// Update discovery status (viewed, liked, etc.)
router.post('/status', async (req, res) => {
  try {
    const { brandId, status } = req.body;
    
    if (!brandId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID and status are required'
      });
    }

    const validStatuses = ['new', 'viewed', 'liked', 'added_to_favorites'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updated = await brandDiscoveryService.updateDiscoveryStatus(
      req.user.id, 
      brandId, 
      status
    );

    if (updated) {
      res.json({
        success: true,
        message: 'Discovery status updated'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Discovery not found'
      });
    }
  } catch (error) {
    console.error('Error updating discovery status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update discovery status' 
    });
  }
});

// Get brand information
router.get('/brand/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const brandInfo = brandDiscoveryService.getBrandInfo(brandId);
    
    if (brandInfo) {
      res.json({
        success: true,
        brand: {
          id: brandId,
          ...brandInfo
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
  } catch (error) {
    console.error('Error getting brand info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get brand information' 
    });
  }
});

// Update discovery preferences
router.post('/preferences', async (req, res) => {
  try {
    const { 
      enableMonthlyDiscovery, 
      preferredDiscoveryTypes, 
      discoveryNotifications 
    } = req.body;

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update discovery preferences
    user.discoveryPreferences = user.discoveryPreferences || {};
    
    if (enableMonthlyDiscovery !== undefined) {
      user.discoveryPreferences.enableMonthlyDiscovery = enableMonthlyDiscovery;
    }
    
    if (preferredDiscoveryTypes !== undefined) {
      user.discoveryPreferences.preferredDiscoveryTypes = preferredDiscoveryTypes;
    }
    
    if (discoveryNotifications !== undefined) {
      user.discoveryPreferences.discoveryNotifications = discoveryNotifications;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Discovery preferences updated',
      preferences: user.discoveryPreferences
    });
  } catch (error) {
    console.error('Error updating discovery preferences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update preferences' 
    });
  }
});

// Admin endpoint: Trigger discovery update for all users
router.post('/admin/update-all', async (req, res) => {
  try {
    // Check if user is admin (you can implement proper admin check)
    const updatedCount = await brandDiscoveryService.updateAllUserDiscoveries();
    
    res.json({
      success: true,
      message: `Updated discoveries for ${updatedCount} users`,
      updatedCount
    });
  } catch (error) {
    console.error('Error in admin discovery update:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update discoveries' 
    });
  }
});

module.exports = router; 