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
import { apiService } from '../../../lib/api';
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

interface ReelItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
  property_id: string;
  property_name: string;
  location?: { city?: string; state?: string };
  price_per_night?: number;
  host_id?: string;
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
  const [activeTab, setActiveTab] = useState<TabType>('reels');
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReels, setLoadingReels] = useState(true);
  const [reelsError, setReelsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingReels, setRefreshingReels] = useState(false);
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

  const fetchReels = async () => {
    try {
      setLoadingReels(true);
      setReelsError(null);
      const data = await apiService.get<any>('/instagram/reels/randomized?limit=20&offset=0');
      const reelList = Array.isArray(data) ? data : (data?.reels ?? []);
      setReels(reelList);
    } catch (error: any) {
      console.error('Fetch reels failed:', error);
      setReelsError(error?.message ?? 'Failed to load reels');
    } finally {
      setLoadingReels(false);
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
      fetchReels();
      fetchSaved();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const onRefreshReels = async () => {
    setRefreshingReels(true);
    await fetchReels();
    setRefreshingReels(false);
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

  const renderReel = ({ item }: { item: ReelItem }) => {
    const imageUri = item.thumbnail_url || item.media_url || item.url;
    const isSaved = savedIds.includes(item.property_id);
    const locationText = [item.location?.city, item.location?.state].filter(Boolean).join(', ');

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={styles.hostAvatar}>
              <Feather name="video" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.postPropertyName} numberOfLines={1}>
                {item.property_name}
              </Text>
              {locationText ? (
                <Text style={styles.postHostName}>
                  {locationText}
                </Text>
              ) : null}
            </View>
          </View>
          {item.price_per_night ? (
            <Text style={styles.reelPriceText}>
              ${item.price_per_night} / night
            </Text>
          ) : null}
        </View>

        {/* Reel Thumbnail Container */}
        <TouchableOpacity
          style={styles.reelMediaContainer}
          onPress={() => handleViewProperty(item.property_id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.postImage}
            resizeMode="cover"
          />
          <View style={styles.playBadge}>
            <Feather name="play" size={24} color="#FFFFFF" />
          </View>
          {item.caption ? (
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
              style={styles.reelGradientOverlay}
            >
              <Text style={styles.reelCaptionText} numberOfLines={2}>
                {item.caption}
              </Text>
            </LinearGradient>
          ) : null}
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleSave(item.property_id)}
            activeOpacity={0.7}
          >
            <Feather
              name="bookmark"
              size={22}
              color={isSaved ? "#D4704A" : "#1A1F1E"}
            />
            <Text style={[
              styles.actionText,
              isSaved && { color: '#D4704A' }
            ]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleViewProperty(item.property_id)}
            activeOpacity={0.7}
          >
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
            <Text style={styles.viewBtnText}>View Property</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        loadingReels ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A6B5A" />
          </View>
        ) : reelsError ? (
          <View style={styles.comingSoonContainer}>
            <Feather name="alert-circle" size={64} color="#D4704A" />
            <Text style={styles.comingSoonTitle}>Failed to load reels</Text>
            <Text style={styles.comingSoonSubtext}>{reelsError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchReels} activeOpacity={0.7}>
              <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : reels.length === 0 ? (
          <View style={styles.comingSoonContainer}>
            <Feather name="video-off" size={64} color="#6B7370" />
            <Text style={styles.comingSoonTitle}>No reels yet</Text>
            <Text style={styles.comingSoonSubtext}>Check back later for video reels</Text>
          </View>
        ) : (
          <FlatList
            data={reels}
            renderItem={renderReel}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshingReels}
                onRefresh={onRefreshReels}
                tintColor="#1A6B5A"
              />
            }
          />
        )
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
