import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep3Screen.styles';

export default function ListStep3Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // States
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [hasReel, setHasReel] = useState<boolean>(false);
  const [isInstaConnected, setIsInstaConnected] = useState<boolean>(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddPhoto = () => {
    if (photoCount >= 10) {
      Alert.alert('Limit Reached', 'You can upload up to 10 photos.');
      return;
    }
    setPhotoCount((prev) => prev + 1);
    Alert.alert('Success', `Photo #${photoCount + 1} added!`);
  };

  const handleUploadReel = () => {
    setHasReel(true);
    Alert.alert('Success', 'Property video reel selected!');
  };

  const handleConnectInstagram = () => {
    setIsInstaConnected(true);
    Alert.alert('Instagram Sync', 'Instagram account successfully synced! Loading posts...');
  };

  const handleContinue = () => {
    navigation.navigate('HostList4' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Progress Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
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
            {photoCount}/10 PHOTOS
          </Text>
        </View>

        <View style={styles.photoGrid}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.photoSquare,
                photoCount > i && { backgroundColor: '#F5E6D0', borderWidth: 1, borderColor: '#D4704A' }
              ]}
              onPress={handleAddPhoto}
              activeOpacity={0.8}
            >
              {photoCount > i ? (
                <Feather name="image" size={24} color="#D4704A" />
              ) : (
                <Feather name="plus" size={24} color="#6B7370" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.gridTip}>{i18n.t('host.listProperty.tipNaturalLight')}</Text>

        {/* PROPERTY REELS */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyReels')}</Text>
        <TouchableOpacity
          style={[
            styles.uploadReelsBox,
            hasReel && { borderColor: '#2D8F5E', backgroundColor: '#F0F9F5' }
          ]}
          onPress={handleUploadReel}
          activeOpacity={0.8}
        >
          <Feather 
            name={hasReel ? "check" : "video"} 
            size={32} 
            color={hasReel ? "#2D8F5E" : "#6B7370"} 
          />
          <Text style={[styles.uploadReelsText, hasReel && { color: '#2D8F5E' }]}>
            {hasReel ? 'Reel Selected ✓' : i18n.t('host.listProperty.uploadShortReel')}
          </Text>
        </TouchableOpacity>

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
  );
}
