import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { GuestTabParamList } from '../../../navigation/GuestNavigator';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import styles from './DiscoverScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DiscoverScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<GuestTabParamList, 'Discover'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = 'reels' | 'posts';

export interface Property {
  id: string;
  host_id: string;
  name: string;
  tagline: string;
  type: string;
  location: {
    address?: string;
    city: string;
    state: string;
  };
  price_per_night: number;
  amenities: string[];
  photos: string[];
  reel_urls?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface Post {
  id: string;
  propertyId: string;
  propertyName: string;
  hostId: string;
  hostName: string;
  photos: string[];
  location: { city: string; state: string };
  pricePerNight: number;
  capacity: { maxGuests: number; rooms: number };
}

// Photo Carousel Component
const PhotoCarousel: React.FC<{ photos: string[] }> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={photos}
        keyExtractor={(_, idx) => `photo-${idx}`}
        renderItem={({ item }) => (
          <Image 
            source={{ uri: item }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {photos.length > 1 && (
        <View style={styles.dotsContainer}>
          {photos.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Post[]>('/discover/posts?limit=20&offset=0');
      setPosts(data ?? []);
    } catch (error) {
      console.error('Fetch posts failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const data = await apiService.get<any[]>('/users/saved-properties', token);
      setSavedIds(data.map(p => p.id));
    } catch (error) {
      console.log('Fetch saved failed');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
      fetchSaved();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleSave = async (propertyId: string) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      
      await apiService.post('/users/save-property', { propertyId }, token);
      
      setSavedIds(prev => 
        prev.includes(propertyId)
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
      
      Alert.alert(
        savedIds.includes(propertyId) ? 'Removed' : 'Saved!',
        savedIds.includes(propertyId) 
          ? 'Removed from your saved list' 
          : 'Added to your saved properties'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigation.navigate('HostPropertyDetail', { propertyId });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostAvatarText}>
              {item.hostName?.charAt(0).toUpperCase() ?? 'H'}
            </Text>
          </View>
          <View>
            <Text style={styles.postPropertyName} numberOfLines={1}>
              {item.propertyName}
            </Text>
            <Text style={styles.postHostName}>
              by {item.hostName}
            </Text>
          </View>
        </View>
      </View>

      {/* Photo Carousel */}
      <PhotoCarousel photos={item.photos} />

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleSave(item.propertyId)}
          activeOpacity={0.7}
        >
          <Feather 
            name="bookmark" 
            size={22} 
            color={savedIds.includes(item.propertyId) ? "#D4704A" : "#1A1F1E"} 
          />
          <Text style={[
            styles.actionText,
            savedIds.includes(item.propertyId) && { color: '#D4704A' }
          ]}>
            {savedIds.includes(item.propertyId) ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.viewBtn}
          onPress={() => handleViewProperty(item.propertyId)}
          activeOpacity={0.7}
        >
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
          <Text style={styles.viewBtnText}>View Property</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Hero Header */}
      <View style={styles.headerWrapper}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }} 
          style={styles.headerAbsoluteImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['#021412', 'rgba(2, 20, 18, 0.9)', 'rgba(2, 20, 18, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['transparent', 'rgba(2, 20, 18, 0.25)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitleText}>Discover</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reels' && styles.tabActive]}
          onPress={() => setActiveTab('reels')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
            Reels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Posts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'reels' ? (
        <View style={styles.comingSoonContainer}>
          <Feather name="video" size={64} color="#84C9BA" />
          <Text style={styles.comingSoonTitle}>Reels Coming Soon</Text>
          <Text style={styles.comingSoonSubtext}>
            Video reels feature launching shortly
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A6B5A" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.comingSoonContainer}>
          <Feather name="image" size={64} color="#6B7370" />
          <Text style={styles.comingSoonTitle}>No posts yet</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1A6B5A"
            />
          }
        />
      )}
    </View>
  );
}
