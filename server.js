const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Add debugging for MongoDB connection
console.log('🔍 Checking MongoDB connection...');
console.log('📊 Database URL:', process.env.MONGODB_URI || 'mongodb://localhost:27017/cherry-picker');

// Auth routes
app.use('/api/auth', authRoutes);

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

// Load brands configuration
const configPath = path.join(__dirname, 'brands-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const BRANDS = config.brands;
const SALE_CATEGORIES = config.saleCategories;

// Load country configuration
const countryConfigPath = path.join(__dirname, 'src', 'country-config.json');
const countryConfig = JSON.parse(fs.readFileSync(countryConfigPath, 'utf8'));

// Function to detect sale category based on text
function detectSaleCategory(text) {
  const lowerText = text.toLowerCase();
  
  for (const [categoryKey, category] of Object.entries(SALE_CATEGORIES)) {
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return categoryKey;
      }
    }
  }
  
  return null;
}

// Function to check for any sale text
function checkForAnySale(text) {
  const salePatterns = [
    /sale/i,
    /discount/i,
    /off/i,
    /clearance/i,
    /reduced/i,
    /markdown/i
  ];
  
  return salePatterns.some(pattern => pattern.test(text));
}

// Function to extract sale percentage
function extractSalePercentage(text) {
  const percentagePatterns = [
    /up\s*to\s*(\d+)%/i,
    /(\d+)%\s*off/i,
    /save\s*up\s*to\s*(\d+)%/i,
    /(\d+)%\s*discount/i,
    /(\d+)%\s*reduction/i,
    /(\d+)%\s*markdown/i
  ];
  
  for (const pattern of percentagePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Function to scrape a single brand
async function scrapeBrand(brandKey, brandConfig) {
  try {
    // Add specific handling for known problematic brands
    const problematicBrands = ['cos', 'arket', 'otherstories', 'h&m'];
    const isProblematic = problematicBrands.includes(brandKey);
    
    // Use shorter timeout for faster processing
    const timeout = isProblematic ? 8000 : 12000;
    
    const response = await axios.get(brandConfig.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: timeout,
      maxRedirects: 10,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all status codes except 5xx
      }
    });

    const $ = cheerio.load(response.data);
    let saleFound = false;
    let salePercentage = null;
    let saleText = '';
    let saleCategory = null;

    // Remove script tags and style tags to avoid JavaScript/JSON content
    $('script, style, noscript').remove();
    
    // Also remove elements that contain JavaScript data
    $('*').each((index, element) => {
      const $element = $(element);
      const text = $element.text();
      if (text.includes('window.__INITIAL_STATE__') || text.includes('__INITIAL_STATE__')) {
        $element.remove();
      }
    });
    
    // Check visible text content for sale information - optimized for speed
    $('body *').each((index, element) => {
      const $element = $(element);
      
      // Skip if element contains only whitespace
      if ($element.text().trim().length === 0) {
        return;
      }
      
      // Skip script-like content
      if ($element.is('script') || $element.is('style') || $element.is('noscript')) {
        return;
      }
      
      // Skip elements that are likely to contain JavaScript
      const elementText = $element.text();
      if (elementText.includes('window.__') || elementText.includes('__INITIAL_STATE__')) {
        return;
      }
      
      const text = $element.text().trim();
      
      // Skip very long text (likely JSON or JavaScript)
      if (text.length > 500) {
        return;
      }
      
      // Skip text that looks like JSON or JavaScript
      if (text.includes('window.__') || text.includes('{"') || text.includes('function(') || text.includes('var ') || 
          text.includes('__INITIAL_STATE__') || text.includes('__typename') || text.includes('countryCode') ||
          text.includes('currencyCode') || text.includes('cultureCode')) {
        return;
      }
      
      // Skip text that contains too many special characters (likely code)
      const specialCharCount = (text.match(/[{}[\]":,;]/g) || []).length;
      if (specialCharCount > 5) {
        return;
      }
      
      // Skip text that's too long (likely JSON/JavaScript)
      if (text.length > 300) {
        return;
      }
      
      // Skip text that contains JavaScript patterns
      if (text.includes('window.__') || text.includes('__INITIAL_STATE__') || 
          text.includes('__typename') || text.includes('countryCode') ||
          text.includes('currencyCode') || text.includes('cultureCode') ||
          text.includes('zvCart') || text.includes('zvUser') ||
          text.includes('zvCheckout') || text.includes('zvGlobalE')) {
        return;
      }
      
      if (checkForAnySale(text)) {
        const detectedCategory = detectSaleCategory(text);
        const percentage = extractSalePercentage(text);
        
        if (detectedCategory || percentage) {
          saleFound = true;
          saleText = text;
          saleCategory = detectedCategory || 'other-sales';
          if (percentage) {
            salePercentage = percentage;
          }
          // Break early if we found a sale
          return false;
        }
      }
    });

          // Clean up sale text to make it more readable
      let cleanSaleText = saleText;
      if (saleText) {
        // Remove extra whitespace and newlines
        cleanSaleText = saleText.replace(/\s+/g, ' ').trim();
        
        // Remove JavaScript/JSON content more aggressively
        cleanSaleText = cleanSaleText.replace(/window\.__[^}]*}/g, '');
        cleanSaleText = cleanSaleText.replace(/\{[^}]*"__[^}]*\}/g, '');
        cleanSaleText = cleanSaleText.replace(/"[^"]*":\s*"[^"]*"/g, '');
        
        // Remove any remaining code-like content
        if (cleanSaleText.includes('window.__') || cleanSaleText.includes('__INITIAL_STATE__')) {
          cleanSaleText = '';
        }
        
        // Remove text that contains too many special characters (likely code)
        const specialCharCount = (cleanSaleText.match(/[{}[\]":,;]/g) || []).length;
        if (specialCharCount > 5) {
          cleanSaleText = '';
        }
        
        // Remove text that's too long (likely JSON)
        if (cleanSaleText.length > 300) {
          cleanSaleText = '';
        }
        
        // Final cleanup
        cleanSaleText = cleanSaleText.trim();
      }
      
      return {
        brandKey,
        brandName: brandConfig.name,
        brandUrl: brandConfig.url,
        saleFound,
        saleText: cleanSaleText,
        salePercentage,
        saleCategory,
        timestamp: new Date().toISOString()
      };

  } catch (error) {
    let errorMessage = error.message;
    
    // Provide more specific error messages
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
    } else if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        errorMessage = 'Access forbidden - website blocking requests';
      } else if (status === 410) {
        errorMessage = 'Website no longer available';
      } else if (status === 404) {
        errorMessage = 'Page not found';
      } else {
        errorMessage = `HTTP ${status} error`;
      }
    }
    
    console.error(`Error scraping ${brandConfig.name}:`, errorMessage);
    return {
      brandKey,
      brandName: brandConfig.name,
      saleFound: false,
      saleText: '',
      salePercentage: null,
      saleCategory: null,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

// API endpoint to get all brands' sale data
app.get('/api/check-all-sales', authenticateToken, async (req, res) => {
  try {
    const countryCode = req.query.country || 'us';
    const countryData = countryConfig.countries[countryCode];
    
    if (!countryData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid country code'
      });
    }

    const results = [];
    
    // Scrape all brands with optimized parallel processing
    const brandEntries = Object.entries(BRANDS);
    const allResults = [];
    
    // Process brands in larger batches for faster processing
    const batchSize = 10; // Increased from 5 to 10
    for (let i = 0; i < brandEntries.length; i += batchSize) {
      const batch = brandEntries.slice(i, i + batchSize);
      
      const batchPromises = batch.map(([brandKey, brandConfig]) => {
        const countryUrl = countryData.brandUrls[brandKey];
        const brandConfigWithCountryUrl = {
          ...brandConfig,
          url: countryUrl || brandConfig.url // Fallback to original URL if country-specific URL not found
        };
        return scrapeBrand(brandKey, brandConfigWithCountryUrl);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results without delays for faster processing
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          // Create a fallback result for failed requests
          const brandKey = batch[index][0];
          const brandConfig = batch[index][1];
          allResults.push({
            brandKey,
            brandName: brandConfig.name,
            brandUrl: brandConfig.url,
            saleFound: false,
            saleText: '',
            salePercentage: null,
            saleCategory: null,
            error: result.reason.message || 'Request failed',
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Reduced delay between batches for faster processing
      if (i + batchSize < brandEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 500ms to 200ms
      }
    }
    
    // Group results by category - only create categories that have brands
    const categorizedResults = {};
    categorizedResults['other-sales'] = [];
    
    allResults.forEach(result => {
      if (result.saleFound) {
        const category = result.saleCategory;
        if (category && SALE_CATEGORIES[category]) {
          if (!categorizedResults[category]) {
            categorizedResults[category] = [];
          }
          categorizedResults[category].push(result);
        } else {
          categorizedResults['other-sales'].push(result);
        }
      }
    });
    
    res.json({
      success: true,
      results: allResults,
      categorizedResults,
      country: countryCode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scraping all brands:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      results: [],
      categorizedResults: {
        'end-of-season': [],
        'other-sales': []
      }
    });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/check-iro-sale', async (req, res) => {
  try {
    const iroResult = await scrapeBrand('iro', BRANDS.iro);
    res.json({
      success: true,
      saleFound: iroResult.saleFound,
      saleText: iroResult.saleText,
      salePercentage: iroResult.salePercentage,
      timestamp: iroResult.timestamp
    });
  } catch (error) {
    console.error('Error scraping IRO website:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      saleFound: false,
      saleText: '',
      salePercentage: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 