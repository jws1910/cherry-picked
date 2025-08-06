import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://localhost:3001';

export default function StyleProfileScreen() {
  const [styleProfile, setStyleProfile] = useState(null);
  const [styleImages, setStyleImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadStyleProfile();
  }, []);

  const loadStyleProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStyleProfile(data.styleProfile);
        setStyleImages(data.styleImages || []);
      }
    } catch (error) {
      console.error('Error loading style profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = async () => {
    if (!newImageUrl.trim()) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/style/add-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          url: newImageUrl.trim(),
          source: 'direct_upload'
        }),
      });

      if (response.ok) {
        setNewImageUrl('');
        setShowAddForm(false);
        await loadStyleProfile();
        Alert.alert('Success', 'Style image added successfully!');
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a real app, you'd upload this to your server
      Alert.alert('Note', 'Image upload from device not implemented in demo. Please use image URL instead.');
    }
  };

  const removeImage = async (imageId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/style/remove-image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadStyleProfile();
        Alert.alert('Success', 'Image removed successfully!');
      } else {
        Alert.alert('Error', 'Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      Alert.alert('Error', 'Failed to remove image');
    }
  };

  const analyzeStyle = async () => {
    setAnalyzing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/style/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadStyleProfile();
        Alert.alert('Success', 'Style analysis updated!');
      } else {
        Alert.alert('Error', 'Failed to analyze style');
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
      Alert.alert('Error', 'Failed to analyze style');
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceBadgeStyle = (confidence) => {
    switch (confidence) {
      case 'high': return { backgroundColor: '#800020', color: 'white' };
      case 'medium': return { backgroundColor: 'rgba(128, 0, 32, 0.6)', color: 'white' };
      case 'low': return { backgroundColor: 'rgba(128, 0, 32, 0.3)', color: '#800020' };
      default: return { backgroundColor: '#f0f0f0', color: '#666' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800020" />
        <Text style={styles.loadingText}>Loading style profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Style Profile</Text>
        <Text style={styles.subtitle}>
          Upload style inspiration images to get personalized recommendations
        </Text>
      </View>

      {styleProfile && (
        <View style={styles.analysisSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Style Analysis</Text>
            <View style={[styles.confidenceBadge, getConfidenceBadgeStyle(styleProfile.confidence)]}>
              <Text style={[styles.confidenceText, { color: getConfidenceBadgeStyle(styleProfile.confidence).color }]}>
                {styleProfile.confidence || 'unknown'} confidence
              </Text>
            </View>
          </View>

          {styleProfile.detectedStyles && styleProfile.detectedStyles.length > 0 && (
            <View style={styles.stylesContainer}>
              <Text style={styles.subsectionTitle}>Detected Styles</Text>
              <View style={styles.tagsContainer}>
                {styleProfile.detectedStyles.map((style, index) => (
                  <View key={index} style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{style}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {styleProfile.colors && styleProfile.colors.length > 0 && (
            <View style={styles.stylesContainer}>
              <Text style={styles.subsectionTitle}>Preferred Colors</Text>
              <View style={styles.tagsContainer}>
                {styleProfile.colors.map((color, index) => (
                  <View key={index} style={styles.colorTag}>
                    <Text style={styles.colorTagText}>{color}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
            onPress={analyzeStyle}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.analyzeButtonText}>Re-analyze Style</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.imagesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Style Images ({styleImages.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.urlInput}
              placeholder="Enter image URL (Pinterest, Instagram, etc.)"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#666"
            />
            <View style={styles.addFormButtons}>
              <TouchableOpacity style={styles.addUrlButton} onPress={addImageUrl}>
                <Text style={styles.addUrlButtonText}>Add URL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                <Text style={styles.pickImageButtonText}>📷 Pick from Device</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {styleImages.length === 0 ? (
          <View style={styles.emptyImages}>
            <Text style={styles.emptyImagesIcon}>📸</Text>
            <Text style={styles.emptyImagesTitle}>No style images yet</Text>
            <Text style={styles.emptyImagesText}>
              Add 5-10 images of outfits you love to get better recommendations!
            </Text>
          </View>
        ) : (
          <View style={styles.imagesGrid}>
            {styleImages.map((image, index) => (
              <View key={index} style={styles.imageCard}>
                <Image source={{ uri: image.url }} style={styles.styleImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(image._id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
                <View style={styles.imageSource}>
                  <Text style={styles.imageSourceText}>
                    {image.source === 'pinterest' ? '📌 Pinterest' : '🔗 URL'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Tips for Better Recommendations</Text>
        <Text style={styles.tip}>• Upload 5-10 style inspiration images</Text>
        <Text style={styles.tip}>• Include different outfit types (casual, formal, etc.)</Text>
        <Text style={styles.tip}>• Add Pinterest screenshots of your style boards</Text>
        <Text style={styles.tip}>• The more images, the better your personalized picks!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 20,
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
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  analysisSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  stylesContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleTag: {
    backgroundColor: 'rgba(128, 0, 32, 0.1)',
    borderColor: 'rgba(128, 0, 32, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  styleTagText: {
    color: '#800020',
    fontSize: 14,
    fontWeight: '500',
  },
  colorTag: {
    backgroundColor: 'rgba(128, 0, 32, 0.05)',
    borderColor: 'rgba(128, 0, 32, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  colorTagText: {
    color: '#666',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesSection: {
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addUrlButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  addUrlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickImageButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  pickImageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyImages: {
    alignItems: 'center',
    padding: 40,
  },
  emptyImagesIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyImagesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  styleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageSource: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  imageSourceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: 'rgba(128, 0, 32, 0.05)',
    borderRadius: 8,
    padding: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
}); 