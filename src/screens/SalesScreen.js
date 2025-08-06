import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001';

const SALE_CATEGORIES = [
  { id: 'ai-picks', label: 'Sales Picked For You', icon: '✨', order: 0 },
  { id: '50-plus', label: '50%+ Off', icon: '🔥', order: 1 },
  { id: '30-49', label: '30-49% Off', icon: '💫', order: 2 },
  { id: '10-29', label: '10-29% Off', icon: '⭐', order: 3 },
  { id: 'flash-sales', label: 'Flash Sales', icon: '⚡', order: 4 },
  { id: 'end-of-season', label: 'End of Season', icon: '🍂', order: 5 },
  { id: 'student-discounts', label: 'Student Discounts', icon: '🎓', order: 6 },
  { id: 'refer-get', label: 'Refer & Get X%', icon: '🤝', order: 7 },
  { id: 'buy-one-get-one', label: 'Buy One Get One', icon: '🛍️', order: 8 },
  { id: 'other-sales', label: 'Other Sales', icon: '✨', order: 9 },
];

export default function SalesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('ai-picks');
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteBrands, setFavoriteBrands] = useState([]);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      await Promise.all([loadSalesData(), loadFavoriteBrands()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/check-all-sales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSalesData(data.categorizedResults || {});
      } else {
        console.error('Failed to load sales data');
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteBrands = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteBrands(data.favoriteBrands || []);
      }
    } catch (error) {
      console.error('Error loading favorite brands:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSalesData();
    setRefreshing(false);
  };

  const toggleFavoriteBrand = async (brandId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const isCurrentlyFavorite = favoriteBrands.includes(brandId);
      
      let updatedFavorites;
      if (isCurrentlyFavorite) {
        updatedFavorites = favoriteBrands.filter(id => id !== brandId);
      } else {
        if (favoriteBrands.length >= 10) {
          Alert.alert('Limit Reached', 'You can only have up to 10 favorite brands.');
          return;
        }
        updatedFavorites = [...favoriteBrands, brandId];
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/favorite-brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ favoriteBrands: updatedFavorites }),
      });

      if (response.ok) {
        setFavoriteBrands(updatedFavorites);
      } else {
        Alert.alert('Error', 'Failed to update favorite brands');
      }
    } catch (error) {
      console.error('Error toggling favorite brand:', error);
      Alert.alert('Error', 'Failed to update favorite brands');
    }
  };

  const openBrandWebsite = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  };

  const renderBrandCard = ({ item: brand }) => {
    const isFavorite = favoriteBrands.includes(brand.id);
    const isOnSale = brand.onSale;

    return (
      <View style={[styles.brandCard, isOnSale && styles.brandCardOnSale]}>
        <View style={styles.brandHeader}>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{brand.name}</Text>
            {brand.salePercentage && (
              <Text style={styles.salePercentage}>{brand.salePercentage}% OFF</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavoriteBrand(brand.id)}
          >
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {brand.aiReasons && selectedCategory === 'ai-picks' && (
          <View style={styles.aiSection}>
            <Text style={styles.aiHeader}>✨ Why we picked this for you:</Text>
            <Text style={styles.aiReasons}>{brand.aiReasons}</Text>
            {brand.aiScore && (
              <Text style={styles.aiScore}>Match Score: {brand.aiScore}/100</Text>
            )}
          </View>
        )}

        <View style={styles.brandActions}>
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => openBrandWebsite(brand.website)}
          >
            <Text style={styles.visitButtonText}>Visit Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.categoryTextActive
      ]}>
        {category.label}
      </Text>
      {salesData[category.id] && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{salesData[category.id].length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const currentSales = salesData[selectedCategory] || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800020" />
        <Text style={styles.loadingText}>Loading sales...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {SALE_CATEGORIES.map(renderCategoryButton)}
      </ScrollView>

      <View style={styles.salesHeader}>
        <Text style={styles.salesTitle}>
          {SALE_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'Sales'}
        </Text>
        <Text style={styles.salesCount}>
          {currentSales.length} {currentSales.length === 1 ? 'brand' : 'brands'}
        </Text>
      </View>

      <FlatList
        data={currentSales}
        renderItem={renderBrandCard}
        keyExtractor={(item) => item.id}
        style={styles.salesList}
        contentContainerStyle={styles.salesListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#800020']}
            tintColor="#800020"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>No sales found</Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'ai-picks' 
                ? 'Add some style images to get personalized recommendations!'
                : 'Check back later for new sales in this category.'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#800020',
    borderColor: '#800020',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: 'rgba(128, 0, 32, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#800020',
    fontWeight: 'bold',
  },
  salesHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  salesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 5,
  },
  salesCount: {
    fontSize: 14,
    color: '#666',
  },
  salesList: {
    flex: 1,
  },
  salesListContent: {
    padding: 15,
  },
  brandCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  brandCardOnSale: {
    borderColor: 'rgba(128, 0, 32, 0.3)',
    backgroundColor: 'rgba(128, 0, 32, 0.02)',
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  salePercentage: {
    fontSize: 14,
    color: '#800020',
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  favoriteIcon: {
    fontSize: 24,
  },
  favoriteIconActive: {
    transform: [{ scale: 1.2 }],
  },
  aiSection: {
    backgroundColor: 'rgba(128, 0, 32, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  aiHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 8,
  },
  aiReasons: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  aiScore: {
    fontSize: 12,
    color: '#800020',
    fontWeight: 'bold',
  },
  brandActions: {
    flexDirection: 'row',
  },
  visitButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  visitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
}); 