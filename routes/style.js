const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Add a style image
router.post('/add-image', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { url, source = 'upload', pinterestData } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.styleImages.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 style images allowed'
      });
    }

    const newImage = {
      url,
      source,
      pinterestData: pinterestData || {},
      uploadedAt: new Date()
    };

    user.styleImages.push(newImage);
    await user.save();

    // Trigger style analysis
    await analyzeUserStyle(userId);

    res.json({
      success: true,
      image: newImage,
      message: 'Style image added successfully'
    });

  } catch (error) {
    console.error('Error adding style image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Remove a style image
router.delete('/remove-image/:imageId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { imageId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.styleImages = user.styleImages.filter(
      img => img._id.toString() !== imageId
    );

    await user.save();

    // Re-analyze style profile
    await analyzeUserStyle(userId);

    res.json({
      success: true,
      message: 'Style image removed successfully'
    });

  } catch (error) {
    console.error('Error removing style image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});



// Analyze user style based on images
router.post('/analyze', async (req, res) => {
  try {
    const userId = req.user.userId;
    const styleProfile = await analyzeUserStyle(userId);

    res.json({
      success: true,
      styleProfile,
      message: 'Style analysis completed'
    });

  } catch (error) {
    console.error('Error analyzing style:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Style analysis function (simplified image-based analysis)
async function analyzeUserStyle(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.styleImages || user.styleImages.length === 0) {
      return {
        detectedStyles: [],
        colors: [],
        patterns: [],
        occasions: [],
        confidence: 'low',
        lastAnalyzed: new Date()
      };
    }

    // Simplified style analysis based on image URLs and descriptions
    // In a real implementation, you would use computer vision APIs
    // like Google Vision, AWS Rekognition, or specialized fashion APIs

    const styleKeywords = {
      minimalist: ['minimal', 'clean', 'simple', 'basic', 'neutral'],
      boho: ['boho', 'bohemian', 'flowy', 'vintage', 'free'],
      casual: ['casual', 'comfortable', 'relaxed', 'everyday'],
      formal: ['formal', 'business', 'professional', 'structured'],
      edgy: ['edgy', 'leather', 'black', 'rock', 'punk'],
      romantic: ['romantic', 'feminine', 'soft', 'floral', 'pink'],
      sporty: ['sporty', 'athletic', 'active', 'gym', 'workout']
    };

    const colorKeywords = {
      black: ['black', 'noir'],
      white: ['white', 'cream', 'ivory'],
      blue: ['blue', 'navy', 'denim'],
      pink: ['pink', 'rose', 'blush'],
      red: ['red', 'burgundy', 'wine'],
      green: ['green', 'olive', 'sage'],
      brown: ['brown', 'tan', 'beige', 'camel'],
      neutral: ['neutral', 'nude', 'taupe']
    };

    const detectedStyles = [];
    const detectedColors = [];

    // Analyze image URLs and Pinterest descriptions
    user.styleImages.forEach(image => {
      const textToAnalyze = (
        image.url + ' ' + 
        (image.pinterestData?.description || '')
      ).toLowerCase();

      // Detect styles
      Object.entries(styleKeywords).forEach(([style, keywords]) => {
        const matches = keywords.filter(keyword => textToAnalyze.includes(keyword));
        if (matches.length > 0) {
          detectedStyles.push(style);
        }
      });

      // Detect colors
      Object.entries(colorKeywords).forEach(([color, keywords]) => {
        const matches = keywords.filter(keyword => textToAnalyze.includes(keyword));
        if (matches.length > 0) {
          detectedColors.push(color);
        }
      });
    });

    // Count and rank styles/colors
    const styleCount = {};
    const colorCount = {};

    detectedStyles.forEach(style => {
      styleCount[style] = (styleCount[style] || 0) + 1;
    });

    detectedColors.forEach(color => {
      colorCount[color] = (colorCount[color] || 0) + 1;
    });

    // Get top styles and colors
    const topStyles = Object.entries(styleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([style]) => style);

    const topColors = Object.entries(colorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    // Determine confidence based on number of images and detected patterns
    let confidence = 'low';
    if (user.styleImages.length >= 5 && topStyles.length >= 2) {
      confidence = 'high';
    } else if (user.styleImages.length >= 3 && topStyles.length >= 1) {
      confidence = 'medium';
    }

    const styleProfile = {
      detectedStyles: topStyles,
      colors: topColors,
      patterns: [], // Could be enhanced with pattern detection
      occasions: [], // Could be enhanced with occasion detection
      confidence,
      lastAnalyzed: new Date()
    };

    // Update user's style profile
    user.styleProfile = styleProfile;
    await user.save();

    return styleProfile;

  } catch (error) {
    console.error('Error in style analysis:', error);
    return {
      detectedStyles: [],
      colors: [],
      patterns: [],
      occasions: [],
      confidence: 'low',
      lastAnalyzed: new Date()
    };
  }
}

module.exports = router; 