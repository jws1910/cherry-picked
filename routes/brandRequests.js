const express = require('express');
const BrandRequest = require('../models/BrandRequest');
const User = require('../models/User');
const requireAdmin = require('../middleware/adminAuth');
const router = express.Router();

// Submit a new brand request
router.post('/submit', async (req, res) => {
  try {
    const { brandName, brandWebsite } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!brandName || !brandWebsite) {
      return res.status(400).json({
        success: false,
        message: 'Brand name and website are required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new brand request
    const brandRequest = new BrandRequest({
      brandName: brandName.trim(),
      brandWebsite: brandWebsite.trim(),
      requestedBy: userId
    });

    await brandRequest.save();

    res.status(201).json({
      success: true,
      message: 'Brand request submitted successfully',
      brandRequest: {
        id: brandRequest._id,
        brandName: brandRequest.brandName,
        brandWebsite: brandRequest.brandWebsite,
        status: brandRequest.status,
        createdAt: brandRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting brand request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit brand request'
    });
  }
});

// Get all brand requests (admin only)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const brandRequests = await BrandRequest.find()
      .populate('requestedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      brandRequests: brandRequests.map(request => ({
        id: request._id,
        brandName: request.brandName,
        brandWebsite: request.brandWebsite,
        status: request.status,
        adminNotes: request.adminNotes,
        requestedBy: request.requestedBy,
        processedBy: request.processedBy,
        createdAt: request.createdAt,
        processedAt: request.processedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching brand requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand requests'
    });
  }
});

// Update brand request status (admin only)
router.put('/admin/:requestId', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const userId = req.user.userId;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find and update the brand request
    const brandRequest = await BrandRequest.findById(requestId);
    if (!brandRequest) {
      return res.status(404).json({
        success: false,
        message: 'Brand request not found'
      });
    }

    brandRequest.status = status;
    brandRequest.adminNotes = adminNotes || '';
    brandRequest.processedBy = userId;
    brandRequest.processedAt = new Date();

    await brandRequest.save();

    res.json({
      success: true,
      message: 'Brand request updated successfully',
      brandRequest: {
        id: brandRequest._id,
        brandName: brandRequest.brandName,
        brandWebsite: brandRequest.brandWebsite,
        status: brandRequest.status,
        adminNotes: brandRequest.adminNotes,
        processedAt: brandRequest.processedAt
      }
    });
  } catch (error) {
    console.error('Error updating brand request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand request'
    });
  }
});

// Get user's own brand requests
router.get('/my-requests', async (req, res) => {
  try {
    const userId = req.user.userId;

    const brandRequests = await BrandRequest.find({ requestedBy: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      brandRequests: brandRequests.map(request => ({
        id: request._id,
        brandName: request.brandName,
        brandWebsite: request.brandWebsite,
        status: request.status,
        adminNotes: request.adminNotes,
        createdAt: request.createdAt,
        processedAt: request.processedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching user brand requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand requests'
    });
  }
});

module.exports = router; 