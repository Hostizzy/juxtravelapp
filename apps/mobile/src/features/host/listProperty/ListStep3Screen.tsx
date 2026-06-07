import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { pickImage } from '../../../services/propertyService';
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
    setIsInstaConnected(true);
    Alert.alert('Instagram Sync', 'Instagram account successfully synced! Loading posts...');
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

  const renderPhotoSlots = () => {
    const slots = [];
    for (let i = 0; i < 10; i++) {
      if (i < photos.length) {
        const uri = photos[i];
        slots.push(
          <View key={i} style={styles.photoSquare}>
            <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemovePhoto(i)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
      } else {
        slots.push(
          <TouchableOpacity
            key={i}
            style={styles.photoSquare}
            onPress={handleAddPhoto}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={24} color="#6B7370" />
          </TouchableOpacity>
        );
      }
    }
    return slots;
  };

  const renderReelSlots = () => {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      if (i < reels.length) {
        const uri = reels[i];
        slots.push(
          <View key={i} style={styles.reelSquare}>
            <View style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#2E3B35', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="video" size={32} color="#84C9BA" />
              <Text style={{ color: '#84C9BA', fontSize: 10, marginTop: 4 }}>Reel {i + 1}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveReel(i)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
      } else {
        slots.push(
          <TouchableOpacity
            key={i}
            style={styles.reelSquare}
            onPress={handleAddReel}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={24} color="#6B7370" />
            <Text style={{ color: '#6B7370', fontSize: 10, marginTop: 4 }}>Add Reel</Text>
          </TouchableOpacity>
        );
      }
    }
    return slots;
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Progress Header */}
        <View style={styles.topBar}>
          <View style={styles.topBarRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>STEP 3 OF 5</Text>
            <Text style={styles.percentText}>60% COMPLETE</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFilled, { width: '60%' }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{i18n.t('host.listProperty.photosTitle')}</Text>
          <Text style={styles.subtitle}>{i18n.t('host.listProperty.photosSub')}</Text>

          {/* PROPERTY PHOTOS */}
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyPhotos')}</Text>
            <Text style={styles.maxPhotosInfo}>
              {photos.length}/10 PHOTOS
            </Text>
          </View>

          <View style={styles.photoGrid}>
            {renderPhotoSlots()}
          </View>
          <Text style={styles.gridTip}>{i18n.t('host.listProperty.tipNaturalLight')}</Text>

          {/* PROPERTY REELS */}
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>PROPERTY REELS</Text>
            <Text style={styles.maxPhotosInfo}>
              {reels.length}/4 REELS
            </Text>
          </View>

          <View style={styles.reelsGrid}>
            {renderReelSlots()}
          </View>

          {/* IMPORT FROM INSTAGRAM */}
          <View style={[styles.instaCard, isInstaConnected && { borderColor: '#2D8F5E' }]}>
            <View style={styles.instaIconCol}>
              <MaterialCommunityIcons 
                name="instagram" 
                size={36} 
                color={isInstaConnected ? "#2D8F5E" : "#D4704A"} 
              />
            </View>
            <View style={styles.instaContentCol}>
              <Text style={styles.instaTitle}>{i18n.t('host.listProperty.connectInsta')}</Text>
              <Text style={styles.instaBody}>{i18n.t('host.listProperty.instaBody')}</Text>
              <TouchableOpacity 
                style={[styles.instaBtn, isInstaConnected && { borderColor: '#2D8F5E' }]} 
                onPress={handleConnectInstagram}
                activeOpacity={0.8}
              >
                <Text style={[styles.instaBtnText, isInstaConnected && { color: '#2D8F5E' }]}>
                  {isInstaConnected ? 'CONNECTED' : i18n.t('host.listProperty.connectInstaBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INFO BANNER */}
          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color="#1A6B5A" style={styles.infoIcon} />
            <Text style={styles.infoText}>{i18n.t('host.listProperty.discoverFeedNote')}</Text>
          </View>

          {/* CONTINUE */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>{i18n.t('host.listProperty.continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
