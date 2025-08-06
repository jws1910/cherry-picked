const User = require('../models/User');
const ForumPost = require('../models/ForumPost');

class AIRecommendationService {
  constructor() {
    this.styleKeywords = {
      minimalist: ['clean', 'simple', 'basic', 'neutral', 'classic'],
      boho: ['flowy', 'vintage', 'pattern', 'embroidered', 'fringe'],
      casual: ['comfortable', 'relaxed', 'everyday', 'cozy', 'soft'],
      formal: ['structured', 'tailored', 'professional', 'elegant', 'sophisticated'],
      edgy: ['leather', 'bold', 'statement', 'dark', 'punk'],
      romantic: ['feminine', 'delicate', 'floral', 'lace', 'soft'],
      sporty: ['athletic', 'active', 'performance', 'technical', 'comfortable']
    };

    this.brandPersonalities = {
      'zara': ['trendy', 'affordable', 'fast-fashion'],
      'acne': ['minimalist', 'scandinavian', 'edgy'],
      'ganni': ['playful', 'colorful', 'danish'],
      'toteme': ['minimalist', 'luxury', 'timeless'],
      'staud': ['fun', 'instagram-worthy', 'statement'],
      'sandro': ['french', 'sophisticated', 'feminine'],
      'maje': ['french', 'romantic', 'chic'],
      'cos': ['minimalist', 'architectural', 'sustainable']
    };
  }

  // Analyze user's style preferences from their style images and posts
  async analyzeUserStyleFromImages(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return this.getDefaultRecommendations();
      }

      // Use existing style profile if available and recent
      if (user.styleProfile && user.styleProfile.confidence !== 'low') {
        const styleProfile = user.styleProfile;
        
        // Still get brand preferences from forum posts
        const userPosts = await ForumPost.find({ author: userId })
          .populate('author', 'firstName lastName')
          .limit(10);

        const mentionedBrands = [];
        let maxPrice = 200;

        for (const post of userPosts) {
          if (post.items && post.items.length > 0) {
            post.items.forEach(item => {
              if (item.brandName) {
                mentionedBrands.push(item.brandName.toLowerCase());
              }
              if (item.price) {
                const priceMatch = item.price.match(/\$(\d+)/);
                if (priceMatch) {
                  const price = parseInt(priceMatch[1]);
                  if (price > maxPrice) {
                    maxPrice = price;
                  }
                }
              }
            });
          }
        }

        const brandCounts = {};
        mentionedBrands.forEach(brand => {
          brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        });

        const preferredBrands = Object.entries(brandCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([brand]) => brand);

        return {
          primaryStyles: styleProfile.detectedStyles || [],
          preferredBrands,
          preferredColors: styleProfile.colors || [],
          estimatedBudget: maxPrice,
          preferredOccasions: styleProfile.occasions || [],
          confidence: styleProfile.confidence
        };
      }

      // Fallback to forum post analysis if no style images
      const userPosts = await ForumPost.find({ author: userId })
        .populate('author', 'firstName lastName')
        .limit(20);

      const styleAnalysis = {
        detectedStyles: [],
        preferredColors: [],
        mentionedBrands: [],
        priceRange: { min: 0, max: 1000 },
        occasions: []
      };

      for (const post of userPosts) {
        const postText = (post.title + ' ' + post.description).toLowerCase();
        
        Object.entries(this.styleKeywords).forEach(([style, keywords]) => {
          const matches = keywords.filter(keyword => postText.includes(keyword));
          if (matches.length > 0) {
            styleAnalysis.detectedStyles.push({
              style,
              confidence: matches.length / keywords.length,
              matches
            });
          }
        });

        if (post.items && post.items.length > 0) {
          post.items.forEach(item => {
            if (item.brandName) {
              styleAnalysis.mentionedBrands.push(item.brandName.toLowerCase());
            }
            if (item.price) {
              const priceMatch = item.price.match(/\$(\d+)/);
              if (priceMatch) {
                const price = parseInt(priceMatch[1]);
                if (price > styleAnalysis.priceRange.max) {
                  styleAnalysis.priceRange.max = price;
                }
              }
            }
          });
        }

        if (post.tags && post.tags.length > 0) {
          post.tags.forEach(tag => {
            const tagLower = tag.toLowerCase();
            if (tagLower.includes('work') || tagLower.includes('office')) {
              styleAnalysis.occasions.push('work');
            } else if (tagLower.includes('party') || tagLower.includes('night')) {
              styleAnalysis.occasions.push('party');
            } else if (tagLower.includes('casual') || tagLower.includes('weekend')) {
              styleAnalysis.occasions.push('casual');
            }
          });
        }
      }

      return this.processStyleAnalysis(styleAnalysis);
    } catch (error) {
      console.error('Error analyzing user style:', error);
      return this.getDefaultRecommendations();
    }
  }

  // Process and rank style analysis results
  processStyleAnalysis(styleAnalysis) {
    // Rank detected styles by confidence
    const rankedStyles = styleAnalysis.detectedStyles
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(s => s.style);

    // Count brand mentions
    const brandCounts = {};
    styleAnalysis.mentionedBrands.forEach(brand => {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const preferredBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand]) => brand);

    return {
      primaryStyles: rankedStyles,
      preferredBrands,
      estimatedBudget: styleAnalysis.priceRange.max || 200,
      preferredOccasions: [...new Set(styleAnalysis.occasions)],
      confidence: rankedStyles.length > 0 ? 'high' : 'low'
    };
  }

  // Generate personalized recommendations for sale items
  async generatePersonalizedRecommendations(userId, availableSales) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // Get user's style profile
      const styleProfile = await this.analyzeUserStyleFromImages(userId);
      
      // Get user's favorite brands
      const favoriteBrands = user.favoriteBrands || [];

      // Score each sale item
      const scoredSales = availableSales.map(sale => {
        let score = 0;
        const reasons = [];

        // Brand preference scoring (highest weight)
        if (favoriteBrands.includes(sale.brandKey)) {
          score += 50;
          reasons.push(`One of your favorite brands`);
        }

        if (styleProfile.preferredBrands.includes(sale.brandKey)) {
          score += 30;
          reasons.push(`Matches your posting history`);
        }

        // Style preference scoring
        const saleText = (sale.saleText || '').toLowerCase();
        styleProfile.primaryStyles.forEach((style, index) => {
          const styleKeywords = this.styleKeywords[style] || [];
          const matches = styleKeywords.filter(keyword => saleText.includes(keyword));
          if (matches.length > 0) {
            const styleScore = (30 - index * 5) * (matches.length / styleKeywords.length);
            score += styleScore;
            reasons.push(`Matches your ${style} style`);
          }
        });

        // Brand personality alignment
        const brandPersonality = this.brandPersonalities[sale.brandKey] || [];
        const personalityMatch = brandPersonality.some(trait => 
          styleProfile.primaryStyles.some(style => 
            this.styleKeywords[style]?.includes(trait)
          )
        );
        if (personalityMatch) {
          score += 20;
          reasons.push(`Brand aligns with your style`);
        }

        // Sale percentage bonus (better deals get higher scores)
        if (sale.salePercentage) {
          const percentage = parseInt(sale.salePercentage);
          if (percentage >= 50) {
            score += 15;
            reasons.push(`Great deal - ${percentage}% off`);
          } else if (percentage >= 30) {
            score += 10;
            reasons.push(`Good deal - ${percentage}% off`);
          }
        }

        // Random factor for discovery (small weight)
        score += Math.random() * 5;

        return {
          ...sale,
          aiScore: Math.round(score),
          aiReasons: reasons,
          personalizedRank: score
        };
      });

      // Sort by score and return top recommendations
      return scoredSales
        .filter(sale => sale.aiScore > 10) // Minimum relevance threshold
        .sort((a, b) => b.personalizedRank - a.personalizedRank)
        .slice(0, 20); // Top 20 recommendations

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  // Get default recommendations for new users
  getDefaultRecommendations() {
    return {
      primaryStyles: ['casual', 'minimalist'],
      preferredBrands: [],
      estimatedBudget: 150,
      preferredOccasions: ['casual', 'work'],
      confidence: 'low'
    };
  }

  // Generate AI-powered style description for user
  async generateStyleDescription(userId) {
    try {
      const styleProfile = await this.analyzeUserStyleFromImages(userId);
      
      if (styleProfile.confidence === 'low') {
        return "We're still learning about your style preferences. Add some style inspiration images to get better recommendations!";
      }

      const styles = styleProfile.primaryStyles.join(', ');
      const brands = styleProfile.preferredBrands.slice(0, 3).join(', ');
      
      let description = `Your style leans towards ${styles}`;
      if (brands) {
        description += ` with a preference for brands like ${brands}`;
      }
      description += `. Your estimated budget range is around $${styleProfile.estimatedBudget}.`;
      
      return description;
    } catch (error) {
      console.error('Error generating style description:', error);
      return "We're analyzing your style images to provide better recommendations.";
    }
  }

  // Update user preferences based on interaction
  async updatePreferencesFromInteraction(userId, interaction) {
    try {
      // Track user interactions with recommendations
      // This can be used to improve future recommendations
      const interactionData = {
        userId,
        action: interaction.action, // 'clicked', 'saved', 'purchased', 'dismissed'
        brandKey: interaction.brandKey,
        reasons: interaction.reasons,
        timestamp: new Date()
      };

      // In a real implementation, you'd store this in a database
      // and use it to refine the recommendation algorithm
      console.log('User interaction recorded:', interactionData);
      
    } catch (error) {
      console.error('Error updating preferences from interaction:', error);
    }
  }
}

module.exports = new AIRecommendationService(); 