import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { pickImage } from '../../../services/propertyService';
import { apiService } from '../../../services/api';
import i18n from '../../../locales/i18n';
import styles from './ListStep3Screen.styles';

type ListStep3RouteProp = RouteProp<RootStackParamList, 'HostList3'>;

export default function ListStep3Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ListStep3RouteProp>();
  const step2Data = route.params;

  // States
  const [photos, setPhotos] = useState<string[]>([]);
  const [reels, setReels] = useState<string[]>([]);
  const [isInstaConnected, setIsInstaConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Add effect after component mounts to handle Instagram callback
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('[PROPERTY_UPLOAD] 🔗 Deep link received:', url);
      
      if (url.includes('instagram/callback')) {
        console.log('[PROPERTY_UPLOAD] ✅ Instagram callback detected');
        setIsInstaConnected(true);
        Alert.alert('Connected!', 'Your Instagram account is connected. Reels will be synced.');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 10) {
      Alert.alert('Limit Reached', 'You can upload up to 10 photos.');
      return;
    }
    try {
      const uri = await pickImage();
      if (uri) {
        setPhotos((prev) => [...prev, uri]);
      }
    } catch (err) {
      console.error('Failed to pick photo', err);
      Alert.alert('Error', 'Failed to pick photo.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access gallery is required to upload videos.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const handleAddReel = async () => {
    if (reels.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 reels.');
      return;
    }
    try {
      const uri = await pickVideo();
      if (uri) {
        setReels((prev) => [...prev, uri]);
      }
    } catch (err) {
      console.error('Failed to pick video', err);
      Alert.alert('Error', 'Failed to pick video.');
    }
  };

  const handleRemoveReel = (index: number) => {
    setReels((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConnectInstagram = () => {
    Alert.alert(
      'Connect Instagram Later',
      'You can connect Instagram AFTER creating your property. Complete listing first, then go to property details to sync reels.',
      [
        { text: 'OK', onPress: () => {} }
      ]
    );
  };

  const handleContinue = () => {
    if (photos.length === 0) {
      Alert.alert('Required Photos', 'Please upload at least one photo of your property.');
      return;
    }
    navigation.navigate('HostList4', {
      ...step2Data,
      photos,
      reels,
    });
  };

  const stepNumber = 3;
  const totalSteps = 5;
  const percentComplete = Math.round(
    ((stepNumber - 1) / totalSteps) * 100
  );

  return (
    <View style={styles.root}>
      {/* Dark Image Background Header */}
      <View style={styles.headerWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
          style={styles.headerBgImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <SafeAreaView style={styles.headerContent} edges={['top']}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtnCircle} onPress={handleBack} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepText}>STEP {stepNumber} OF {totalSteps}</Text>
              <Text style={styles.percentText}>{percentComplete}% COMPLETE</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFilled, { width: `${percentComplete}%` }]} />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{i18n.t('host.listProperty.photosTitle') || 'Photos and video reels of your property'}</Text>
          <Text style={styles.subtitle}>{i18n.t('host.listProperty.photosSub') || 'Upload pictures and reels to showcase your stay.'}</Text>

          {/* PROPERTY PHOTOS */}
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyPhotos') || 'PROPERTY PHOTOS'}</Text>
            <Text style={styles.maxPhotosInfo}>
              {photos.length}/10 PHOTOS
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPhotos}
          >
            {photos.map((uri, idx) => (
              <View key={idx} style={styles.photoSquareLarge}>
                <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                <TouchableOpacity
                  style={styles.removeBtnLarge}
                  onPress={() => handleRemovePhoto(idx)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 10 && (
              <TouchableOpacity
                style={styles.photoSquareLargeDashed}
                onPress={handleAddPhoto}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={24} color="#6B7370" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, color: '#6B7370', fontWeight: '600' }}>Add Photos</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={styles.gridTip}>{i18n.t('host.listProperty.tipNaturalLight') || 'Use natural light and capture wide angles.'}</Text>

          {/* PROPERTY REELS */}
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>PROPERTY REELS</Text>
            <Text style={styles.maxPhotosInfo}>
              {reels.length}/4 REELS
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPhotos}
          >
            {reels.map((uri, idx) => (
              <View key={idx} style={styles.photoSquareLarge}>
                <View style={{ width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#2E3B35', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="video" size={32} color="#84C9BA" />
                  <Text style={{ color: '#84C9BA', fontSize: 10, marginTop: 4 }}>Reel {idx + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtnLarge}
                  onPress={() => handleRemoveReel(idx)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {reels.length < 4 && (
              <TouchableOpacity
                style={styles.photoSquareLargeDashed}
                onPress={handleAddReel}
                activeOpacity={0.8}
              >
                <Feather name="video" size={24} color="#6B7370" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, color: '#6B7370', fontWeight: '600' }}>Add Reel</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* IMPORT FROM INSTAGRAM */}
          <View style={[styles.instaCard, isInstaConnected && { borderColor: '#1A6B5A' }]}>
            <View style={styles.instaIconCol}>
              <MaterialCommunityIcons 
                name="instagram" 
                size={36} 
                color={isInstaConnected ? "#1A6B5A" : "#D4704A"} 
              />
            </View>
            <View style={styles.instaContentCol}>
              <Text style={styles.instaTitle}>{i18n.t('host.listProperty.connectInsta') || 'Sync with Instagram'}</Text>
              <Text style={styles.instaBody}>{i18n.t('host.listProperty.instaBody') || 'Import photos and reels directly from your profile posts.'}</Text>
              <TouchableOpacity 
                style={[
                  styles.instaBtn, 
                  isInstaConnected && { borderColor: '#1A6B5A' },
                  loading && { opacity: 0.6 }
                ]} 
                onPress={loading ? undefined : handleConnectInstagram}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={[styles.instaBtnText, isInstaConnected && { color: '#1A6B5A' }]}>
                  {loading ? 'Connecting...' : (isInstaConnected ? 'CONNECTED' : i18n.t('host.listProperty.connectInstaBtn') || 'Sync Profile')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INFO BANNER */}
          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color="#1A6B5A" style={styles.infoIcon} />
            <Text style={styles.infoText}>{i18n.t('host.listProperty.discoverFeedNote') || 'Video reels will display on the guest discover feed.'}</Text>
          </View>

          {/* CONTINUE */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>{i18n.t('host.listProperty.continue') || 'Continue'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
