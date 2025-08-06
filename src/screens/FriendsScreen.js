import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function FriendsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Friends</Text>
        <Text style={styles.subtitle}>Connect with fashion-forward friends</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonIcon}>🚧</Text>
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonText}>
          Friend features including friend requests, viewing friends' favorite brands, 
          and chatting about fashion will be available in the next update!
        </Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>What's Coming:</Text>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📧</Text>
          <Text style={styles.featureText}>Add friends by email</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>❤️</Text>
          <Text style={styles.featureText}>View friends' favorite brands</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>💬</Text>
          <Text style={styles.featureText}>Chat about brands and styles</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>Privacy controls</Text>
        </View>
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
  header: {
    marginBottom: 40,
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
  comingSoon: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 30,
  },
  comingSoonIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    backgroundColor: 'rgba(128, 0, 32, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 40,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
}); 