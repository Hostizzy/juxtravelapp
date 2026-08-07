import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../lib/api';
import { uploadPhoto } from '../../../services/propertyService';
import i18n from '../../../locales/i18n';
import styles from './InstagramConnectScreen.styles';

type InstagramConnectScreenRouteProp = RouteProp<RootStackParamList, 'InstagramConnect'>;
type InstagramConnectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'InstagramConnect'>;

export interface InstagramReel {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const cellWidth = (SCREEN_WIDTH - 48) / 3;

export default function InstagramConnectScreen() {
  const navigation = useNavigation<InstagramConnectScreenNavigationProp>();
  const route = useRoute<InstagramConnectScreenRouteProp>();
  const { propertyId } = route.params;

  // Connection & reels states
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [selectedReels, setSelectedReels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch Connection status on mount
  const checkConnection = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const data = await apiService.get<{ connected: boolean; username?: string }>(
        '/instagram/status',
        token
      );
      setConnected(data.connected);
      if (data.username) {
        setUsername(data.username);
      }
      if (data.connected) {
        fetchReels();
      }
    } catch (error) {
      console.error('Failed to get Instagram connection status:', error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for Instagram OAuth callback deep link
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('[INSTAGRAM_SCREEN] Deep link received:', url);
      
      if (url.includes('instagram-callback')) {
        // Parse URL params
        const params = new URLSearchParams(url.split('?')[1] || '');
        const status = params.get('status');
        
        if (status === 'success') {
          console.log('[INSTAGRAM_SCREEN] ✅ OAuth success, refreshing');
          Alert.alert('Success!', 'Instagram connected successfully. Loading your reels...');
          // Refresh connection status and fetch reels
          checkConnection();
        } else {
          const errorMsg = params.get('message') || 'Failed to connect Instagram';
          Alert.alert('Error', decodeURIComponent(errorMsg));
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check initial URL (if app opened from deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // Fetch reels
  const fetchReels = async () => {
    setFetching(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const data = await apiService.get<InstagramReel[]>('/instagram/reels', token);
      setReels(data);
    } catch (error) {
      console.error('Fetch reels failed:', error);
      Alert.alert('Error', i18n.t('instagram.noReels') || 'Failed to fetch reels');
    } finally {
      setFetching(false);
    }
  };

  // Connect Instagram OAuth URL
  const handleConnect = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const url = `/instagram/auth-url${propertyId ? `?propertyId=${propertyId}` : ''}`;
      const data = await apiService.get<{ url: string }>(url, token);
      // Open in browser
      await Linking.openURL(data.url);
    } catch (error) {
      Alert.alert('Error', 'Failed to get auth URL');
    }
  };

  // Disconnect Instagram
  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Instagram',
      'Are you sure you want to disconnect your Instagram profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('access_token');
              if (!token) return;
              await apiService.post('/instagram/disconnect', {}, token);
              setConnected(false);
              setUsername('');
              setReels([]);
              setSelectedReels([]);
              Alert.alert('Success', 'Instagram profile disconnected.');
            } catch (err) {
              Alert.alert('Error', 'Failed to disconnect Instagram.');
            }
          },
        },
      ]
    );
  };

  // Toggle Selection
  const handleToggleReel = (mediaUrl: string) => {
    setSelectedReels((prev) => {
      if (prev.includes(mediaUrl)) {
        return prev.filter((url) => url !== mediaUrl);
      }
      if (prev.length >= 4) {
        Alert.alert('Limit Reached', 'Select up to 4 reels');
        return prev;
      }
      return [...prev, mediaUrl];
    });
  };

  // Pick Manual Video from Gallery
  const pickVideo = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required to upload videos.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  // Manual Upload Handler
  const handleManualUpload = async () => {
    try {
      const uri = await pickVideo();
      if (!uri) return;
      setLoading(true);
      const url = await uploadPhoto(uri); // uploadPhoto supports video as multipart file
      if (url) {
        if (selectedReels.length >= 4) {
          Alert.alert('Limit Reached', 'Select up to 4 reels');
          return;
        }
        setSelectedReels((prev) => [...prev, url]);
        Alert.alert('Success', 'Video uploaded successfully and added to selection.');
      } else {
        Alert.alert('Upload Failed', 'Failed to upload video.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during manual upload.');
    } finally {
      setLoading(false);
    }
  };

  // Save Selected Reels
  const handleSave = async () => {
    if (selectedReels.length === 0) return;
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;

      await apiService.post(
        '/instagram/save-reels',
        {
          propertyId,
          reelUrls: selectedReels,
        },
        token
      );

      Alert.alert('Success! 🎉', 'Reels saved to your property', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save reels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Instagram Reels</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* CONNECT CARD (if not connected) */}
          {!connected ? (
            <View style={styles.connectCard}>
              <View style={styles.instagramIcon}>
                <Feather name="instagram" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.connectTitle}>
                {i18n.t('instagram.connect') || 'Connect Instagram'}
              </Text>
              <Text style={styles.connectSubtitle}>
                Import your reels directly from Instagram to showcase your property
              </Text>
              
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#1A6B5A" />
                <Text style={styles.benefitText}>Auto-import latest reels</Text>
              </View>
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#1A6B5A" />
                <Text style={styles.benefitText}>Sync with your Instagram</Text>
              </View>
              <View style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color="#1A6B5A" />
                <Text style={styles.benefitText}>Reach more travelers</Text>
              </View>

              <TouchableOpacity style={styles.connectButton} onPress={handleConnect} activeOpacity={0.8}>
                <Text style={styles.connectButtonText}>Connect Instagram</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* CONNECTED CARD (if connected) */
            <View style={styles.connectCard}>
              <View style={styles.connectedBadge}>
                <Feather name="check" size={14} color="#1A6B5A" />
                <Text style={styles.connectedBadgeText}>
                  {i18n.t('instagram.connected') || 'Connected'}
                </Text>
              </View>
              <Text style={styles.connectedUsername}>Account ID: {username}</Text>
              
              {fetching ? (
                <ActivityIndicator size="small" color="#1A6B5A" style={{ marginVertical: 12 }} />
              ) : (
                <TouchableOpacity style={styles.fetchButton} onPress={fetchReels} activeOpacity={0.8}>
                  <Text style={styles.fetchButtonText}>
                    {i18n.t('instagram.fetchReels') || 'Fetch Latest Reels'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect} activeOpacity={0.7}>
                <Text style={styles.disconnectButtonText}>
                  {i18n.t('instagram.disconnect') || 'Disconnect'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* REELS GRID SECTION */}
          {connected && reels.length > 0 && (
            <View>
              <Text style={styles.gridHeader}>
                {i18n.t('instagram.selectReels') || 'Select up to 4 reels'}
              </Text>
              <View style={styles.reelsGrid}>
                {reels.map((item) => {
                  const isSelected = selectedReels.includes(item.media_url);
                  const thumbnail = item.thumbnail_url || item.media_url;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.reelCell,
                        { width: cellWidth, height: cellWidth },
                        isSelected && styles.reelCellSelected,
                      ]}
                      onPress={() => handleToggleReel(item.media_url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: thumbnail }} style={styles.reelThumbnail} />
                      <Feather name="play" size={24} color="#FFFFFF" style={styles.playIcon} />
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Feather name="check" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* MANUAL UPLOAD SECTION */}
          <View>
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.manualUploadBtn} onPress={handleManualUpload} activeOpacity={0.8}>
              <Text style={styles.manualUploadBtnText}>
                {i18n.t('instagram.manualUpload') || 'Upload Manually'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* SAVE ACTION BUTTON (BOTTOM) */}
        {selectedReels.length > 0 && (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FAF8F4' }}>
            {loading ? (
              <ActivityIndicator size="small" color="#D4704A" style={{ marginVertical: 24 }} />
            ) : (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>
                  {i18n.t('instagram.saveReels') || 'Save Reels to Property'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
