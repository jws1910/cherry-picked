const User = require('../models/User');
const Notification = require('../models/Notification');
const brandsConfig = require('../src/brands-config.json');

class BrandSaleDetector {
  constructor() {
    this.brandStatusCache = new Map(); // Cache to track brand sale status
    this.lastCheckTime = new Date();
  }

  // Initialize the detector with current brand statuses
  async initialize() {
    console.log('🔍 Initializing brand sale detector...');
    
    // Initialize cache with current brand statuses
    for (const [brandKey, brandConfig] of Object.entries(brandsConfig.brands)) {
      this.brandStatusCache.set(brandKey, {
        hasSale: false,
        lastChecked: new Date(),
        saleUrl: null
      });
    }
    
    console.log(`✅ Brand sale detector initialized for ${this.brandStatusCache.size} brands`);
  }

  // Check if a brand has started a sale
  async checkBrandSaleStatus(brandKey, currentSaleStatus, saleUrl = null) {
    const cachedStatus = this.brandStatusCache.get(brandKey);
    
    if (!cachedStatus) {
      // First time checking this brand
      this.brandStatusCache.set(brandKey, {
        hasSale: currentSaleStatus,
        lastChecked: new Date(),
        saleUrl: saleUrl
      });
      return false; // No change detected on first check
    }

    // Check if sale status has changed
    const saleStarted = !cachedStatus.hasSale && currentSaleStatus;
    
    if (saleStarted) {
      console.log(`🎉 Sale detected for ${brandKey}!`);
      
      // Update cache
      this.brandStatusCache.set(brandKey, {
        hasSale: currentSaleStatus,
        lastChecked: new Date(),
        saleUrl: saleUrl
      });

      // Notify users who have this brand in their favorites
      await this.notifyUsersOfSale(brandKey, saleUrl);
      
      return true;
    } else if (cachedStatus.hasSale !== currentSaleStatus) {
      // Update cache even if sale ended
      this.brandStatusCache.set(brandKey, {
        hasSale: currentSaleStatus,
        lastChecked: new Date(),
        saleUrl: saleUrl
      });
    }

    return false;
  }

  // Notify users who have this brand in their favorites
  async notifyUsersOfSale(brandKey, saleUrl) {
    try {
      const brandConfig = brandsConfig.brands[brandKey];
      if (!brandConfig) {
        console.error(`❌ Brand config not found for ${brandKey}`);
        return;
      }

      // Find all users who have this brand in their favorites
      const usersWithBrand = await User.find({
        favoriteBrands: brandKey
      });

      console.log(`📢 Notifying ${usersWithBrand.length} users about ${brandConfig.name} sale`);

      // Create notifications for each user
      const notifications = usersWithBrand.map(user => ({
        userId: user._id,
        type: 'brand_sale',
        title: `${brandConfig.name} is on sale!`,
        message: `${brandConfig.name} has started a sale. Check it out now!`,
        brandKey: brandKey,
        brandName: brandConfig.name,
        saleUrl: saleUrl || brandConfig.url,
        isRead: false,
        createdAt: new Date()
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} sale notifications`);
      }

    } catch (error) {
      console.error('❌ Error creating sale notifications:', error);
    }
  }

  // Get current brand status from cache
  getBrandStatus(brandKey) {
    return this.brandStatusCache.get(brandKey);
  }

  // Get all brand statuses
  getAllBrandStatuses() {
    return Object.fromEntries(this.brandStatusCache);
  }

  // Update brand status (called from scraping service)
  async updateBrandStatus(brandKey, hasSale, saleUrl = null) {
    return await this.checkBrandSaleStatus(brandKey, hasSale, saleUrl);
  }



  // Get brands that currently have sales
  getBrandsWithSales() {
    const brandsWithSales = [];
    for (const [brandKey, status] of this.brandStatusCache.entries()) {
      if (status.hasSale) {
        brandsWithSales.push({
          brandKey,
          brandName: brandsConfig.brands[brandKey]?.name || brandKey,
          saleUrl: status.saleUrl,
          lastChecked: status.lastChecked
        });
      }
    }
    return brandsWithSales;
  }
}

module.exports = new BrandSaleDetector(); 