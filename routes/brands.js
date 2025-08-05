const express = require('express');
const requireAdmin = require('../middleware/adminAuth');
const router = express.Router();

// Get all brands (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    // For now, we'll read from the brands-config.json file
    // In a real app, this would come from a database
    const brandsConfig = require('../src/brands-config.json');
    
    const brands = Object.entries(brandsConfig).map(([key, brand]) => ({
      id: key,
      key: key,
      name: brand.name,
      url: brand.url
    }));

    res.json({
      success: true,
      brands: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Add new brand (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { brandName, brandKey, brandUrl } = req.body;
    
    if (!brandName || !brandKey || !brandUrl) {
      return res.status(400).json({
        success: false,
        message: 'Brand name, key, and URL are required'
      });
    }

    // In a real app, this would save to a database
    // For now, we'll just return success
    console.log('New brand added:', { brandName, brandKey, brandUrl });

    res.json({
      success: true,
      message: 'Brand added successfully',
      brand: {
        id: brandKey,
        key: brandKey,
        name: brandName,
        url: brandUrl
      }
    });
  } catch (error) {
    console.error('Error adding brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router; 