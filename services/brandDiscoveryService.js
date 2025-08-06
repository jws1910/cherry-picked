const User = require('../models/User');

class BrandDiscoveryService {
  constructor() {
    // Extended brand database with discovery metadata
    this.brandDatabase = {
      // Trending/Popular Brands
      acne: { 
        name: 'Acne Studios', 
        category: 'luxury', 
        style: ['minimalist', 'edgy'], 
        trending: true,
        priceRange: 'high',
        sustainability: false,
        description: 'Swedish fashion house known for minimalist designs and premium denim'
      },
      ganni: { 
        name: 'Ganni', 
        category: 'trending', 
        style: ['boho', 'feminine', 'colorful'], 
        trending: true,
        priceRange: 'mid-high',
        sustainability: true,
        description: 'Danish brand famous for playful prints and sustainable practices'
      },
      nanushka: { 
        name: 'Nanushka', 
        category: 'emerging', 
        style: ['minimalist', 'sustainable'], 
        trending: true,
        priceRange: 'mid-high',
        sustainability: true,
        description: 'Hungarian brand focusing on vegan leather and conscious fashion'
      },
      
      // Emerging Brands
      bevza: { 
        name: 'Bevza', 
        category: 'emerging', 
        style: ['minimalist', 'architectural'], 
        trending: false,
        priceRange: 'mid-high',
        sustainability: true,
        description: 'Ukrainian brand known for architectural silhouettes and conscious production'
      },
      khaite: { 
        name: 'Khaite', 
        category: 'emerging', 
        style: ['minimalist', 'luxury'], 
        trending: true,
        priceRange: 'high',
        sustainability: false,
        description: 'American brand offering elevated basics with a modern edge'
      },
      paloma: { 
        name: 'Paloma Wool', 
        category: 'emerging', 
        style: ['artistic', 'colorful'], 
        trending: false,
        priceRange: 'mid',
        sustainability: true,
        description: 'Spanish brand creating art-inspired clothing with sustainable materials'
      },
      
      // Sustainable Brands
      eileen: { 
        name: 'Eileen Fisher', 
        category: 'sustainable', 
        style: ['minimalist', 'timeless'], 
        trending: false,
        priceRange: 'high',
        sustainability: true,
        description: 'Pioneer in sustainable fashion with timeless, easy-to-wear pieces'
      },
      kotn: { 
        name: 'Kotn', 
        category: 'sustainable', 
        style: ['casual', 'minimalist'], 
        trending: false,
        priceRange: 'mid',
        sustainability: true,
        description: 'Egyptian cotton basics brand supporting local farming communities'
      },
      
      // Affordable/Accessible
      arket: { 
        name: 'Arket', 
        category: 'affordable', 
        style: ['minimalist', 'functional'], 
        trending: false,
        priceRange: 'low-mid',
        sustainability: true,
        description: 'H&M group brand focusing on modern essentials and sustainability'
      },
      weekday: { 
        name: 'Weekday', 
        category: 'affordable', 
        style: ['edgy', 'youth'], 
        trending: false,
        priceRange: 'low-mid',
        sustainability: false,
        description: 'Scandinavian denim and streetwear brand for the creative generation'
      }
    };
  }

  // Generate monthly discoveries for a user
  async generateMonthlyDiscoveries(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.discoveryPreferences?.enableMonthlyDiscovery) {
        return null;
      }

      const currentMonth = this.getCurrentMonth();
      
      // Check if user already has discoveries for this month
      const existingDiscoveries = user.newlyDiscoveredBrands?.filter(
        discovery => discovery.discoveryMonth === currentMonth
      ) || [];

      if (existingDiscoveries.length >= 3) {
        return existingDiscoveries; // Already has this month's discoveries
      }

      // Generate new discoveries
      const newDiscoveries = await this.selectBrandsForUser(user, currentMonth);
      
      // Add to user's discoveries
      user.newlyDiscoveredBrands = user.newlyDiscoveredBrands || [];
      user.newlyDiscoveredBrands.push(...newDiscoveries);
      user.lastDiscoveryUpdate = new Date();

      await user.save();

      return newDiscoveries;
    } catch (error) {
      console.error('Error generating monthly discoveries:', error);
      return null;
    }
  }

  // Select 3 brands for a user based on their profile
  async selectBrandsForUser(user, discoveryMonth) {
    const userStyle = user.styleProfile?.detectedStyles || [];
    const userFavorites = user.favoriteBrands || [];
    const userPreferences = user.discoveryPreferences?.preferredDiscoveryTypes || [];
    
    // Get all previous discoveries to avoid duplicates
    const previousDiscoveries = user.newlyDiscoveredBrands?.map(d => d.brandId) || [];
    const allUserBrands = [...userFavorites, ...previousDiscoveries];

    const availableBrands = Object.keys(this.brandDatabase).filter(
      brandId => !allUserBrands.includes(brandId)
    );

    if (availableBrands.length === 0) {
      return []; // No new brands to discover
    }

    // Score brands based on user profile
    const scoredBrands = availableBrands.map(brandId => {
      const brand = this.brandDatabase[brandId];
      let score = 0;

      // Style match scoring
      const styleMatches = brand.style.filter(style => 
        userStyle.some(userStyleItem => 
          userStyleItem.toLowerCase().includes(style.toLowerCase())
        )
      ).length;
      score += styleMatches * 30;

      // Preference match scoring
      if (userPreferences.includes(brand.category)) {
        score += 25;
      }

      // Trending bonus
      if (brand.trending) {
        score += 15;
      }

      // Sustainability bonus if user has sustainable preferences
      if (brand.sustainability && userPreferences.includes('sustainable')) {
        score += 20;
      }

      // Random factor for diversity
      score += Math.random() * 10;

      return {
        brandId,
        brand,
        score,
        discoveryReason: this.generateDiscoveryReason(brand, styleMatches, userPreferences)
      };
    });

    // Sort by score and select top 3
    const selectedBrands = scoredBrands
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => ({
        brandId: item.brandId,
        discoveryMonth,
        discoveryReason: item.discoveryReason,
        trending: item.brand.trending,
        discoveredAt: new Date(),
        status: 'new'
      }));

    return selectedBrands;
  }

  // Generate a reason why this brand was discovered
  generateDiscoveryReason(brand, styleMatches, userPreferences) {
    const reasons = [];

    if (styleMatches > 0) {
      reasons.push(`matches your ${brand.style.join(' and ')} style`);
    }

    if (brand.trending) {
      reasons.push('trending right now');
    }

    if (brand.sustainability && userPreferences.includes('sustainable')) {
      reasons.push('focuses on sustainable practices');
    }

    if (userPreferences.includes(brand.category)) {
      reasons.push(`aligns with your ${brand.category} preferences`);
    }

    if (reasons.length === 0) {
      reasons.push('offers a fresh perspective for your wardrobe');
    }

    return `Discovered because it ${reasons.slice(0, 2).join(' and ')}.`;
  }

  // Get current month in YYYY-MM format
  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get brand info by ID
  getBrandInfo(brandId) {
    return this.brandDatabase[brandId] || null;
  }

  // Mark discovery as viewed/interacted
  async updateDiscoveryStatus(userId, brandId, status) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const discovery = user.newlyDiscoveredBrands?.find(d => d.brandId === brandId);
      if (discovery) {
        discovery.status = status;
        await user.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating discovery status:', error);
      return false;
    }
  }

  // Get user's current monthly discoveries with brand info
  async getUserDiscoveries(userId, includeHistory = false) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      let discoveries = user.newlyDiscoveredBrands || [];
      
      if (!includeHistory) {
        const currentMonth = this.getCurrentMonth();
        discoveries = discoveries.filter(d => d.discoveryMonth === currentMonth);
      }

      // Enrich with brand information
      return discoveries.map(discovery => ({
        ...discovery.toObject(),
        brandInfo: this.getBrandInfo(discovery.brandId)
      }));
    } catch (error) {
      console.error('Error getting user discoveries:', error);
      return [];
    }
  }

  // Check if it's time for monthly discovery update
  shouldUpdateDiscoveries(user) {
    if (!user.discoveryPreferences?.enableMonthlyDiscovery) {
      return false;
    }

    const currentMonth = this.getCurrentMonth();
    const lastUpdate = user.lastDiscoveryUpdate;
    
    if (!lastUpdate) {
      return true; // First time
    }

    const lastUpdateMonth = `${lastUpdate.getFullYear()}-${String(lastUpdate.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth !== lastUpdateMonth;
  }

  // Batch update discoveries for all eligible users
  async updateAllUserDiscoveries() {
    try {
      const users = await User.find({
        'discoveryPreferences.enableMonthlyDiscovery': true
      });

      let updatedCount = 0;
      
      for (const user of users) {
        if (this.shouldUpdateDiscoveries(user)) {
          const discoveries = await this.generateMonthlyDiscoveries(user._id);
          if (discoveries && discoveries.length > 0) {
            updatedCount++;
            console.log(`✨ Generated ${discoveries.length} new discoveries for user ${user._id}`);
          }
        }
      }

      console.log(`🎯 Monthly discovery update complete: ${updatedCount} users updated`);
      return updatedCount;
    } catch (error) {
      console.error('Error in batch discovery update:', error);
      return 0;
    }
  }
}

module.exports = new BrandDiscoveryService(); 