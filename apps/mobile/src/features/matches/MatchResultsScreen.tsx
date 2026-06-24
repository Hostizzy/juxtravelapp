import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { MatchResult } from '../../services/matchService';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../services/api';
import i18n from '../../locales/i18n';
import styles from './MatchResultsScreen.styles';

type ExtendedParamList = RootStackParamList & {
  HostPropertyDetail: {
    propertyId: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    matchReasons?: string[];
  };
};

type MatchResultsScreenRouteProp = RouteProp<ExtendedParamList, 'MatchResults'>;

type MatchResultsScreenNavigationProp = NativeStackNavigationProp<
  ExtendedParamList,
  'MatchResults'
>;

export default function MatchResultsScreen() {
  const navigation = useNavigation<MatchResultsScreenNavigationProp>();
  const route = useRoute<MatchResultsScreenRouteProp>();

  const {
    destination,
    checkIn,
    checkOut,
    guests,
    moods,
    matches: initialMatches,
    savedIds: initialSavedIds,
  } = route.params;

  const [matches] = useState<MatchResult[]>(initialMatches ?? []);
  const [savedProperties, setSavedProperties] = useState<string[]>(initialSavedIds ?? []);

  const handleSave = async (propertyId: string) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;

      await apiService.post(
        '/users/save-property',
        { propertyId },
        token
      );

      setSavedProperties(prev => 
        prev.includes(propertyId)
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );

      Alert.alert(
        'Saved! ✓',
        'Property saved to your profile'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save');
    }
  };

  const handleViewProperty = (propertyId: string, matchReasons?: string[]) => {
    navigation.navigate('HostPropertyDetail', {
      propertyId,
      checkIn,
      checkOut,
      guests,
      matchReasons,
    });
  };

  const getProgressBorderColor = (score: number) => {
    if (score >= 90) {
      return {
        borderColor: '#1A6B5A',
      };
    } else if (score >= 80) {
      return {
        borderColor: '#1A6B5A',
        borderBottomColor: '#E8E2D9',
      };
    } else {
      return {
        borderColor: '#1A6B5A',
        borderBottomColor: '#E8E2D9',
        borderLeftColor: '#E8E2D9',
      };
    }
  };

  const getAmenityIconName = (amenity: string): keyof typeof Feather.glyphMap => {
    const am = amenity.toLowerCase();
    if (am.includes('wifi')) return 'wifi';
    if (am.includes('tv')) return 'tv';
    if (am.includes('hot') || am.includes('water')) return 'droplet';
    if (am.includes('park')) return 'info';
    if (am.includes('ac') || am.includes('air')) return 'wind';
    if (am.includes('kitchen')) return 'coffee';
    return 'check';
  };

  const getReasonIconName = (idx: number): keyof typeof Feather.glyphMap => {
    if (idx === 0) return 'compass';
    if (idx === 1) return 'home';
    return 'star';
  };

  if (matches.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <View style={styles.container}>
          {/* Top Hero Header */}
          <View style={styles.headerWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800' }} 
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitleText}>Your Matches</Text>
              
              <View style={{ width: 40 }} />
            </View>
          </View>

          <View style={styles.emptyContainer}>
            <Feather name="alert-circle" size={48} color="#6B7370" />
            <Text style={styles.emptyTitle}>{i18n.t('matches.noMatches')}</Text>
            <Text style={styles.emptySub}>{i18n.t('matches.noMatchesSub')}</Text>
            <TouchableOpacity
              style={styles.backToPlanBtn}
              onPress={() => navigation.navigate('PlanStep1')}
              activeOpacity={0.8}
            >
              <Text style={styles.backToPlanText}>{i18n.t('matches.backToPlan')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Top Hero Header */}
        <View style={styles.headerWrapper}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800' }} 
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>Your Matches</Text>
            
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
              <Feather name="sliders" size={14} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              We found {matches.length} perfect matches for <Text style={styles.destinationText}>{destination}</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Based on your preferences
            </Text>
            <View style={styles.moodsRow}>
              {moods.map((mood) => (
                <View key={mood} style={styles.moodChip}>
                  <Feather name="tag" size={12} color="#1A6B5A" />
                  <Text style={styles.moodChipText}>
                    {i18n.t(`plan.step3.${mood}`) || mood.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Matches List */}
          {matches.map((result, index) => {
            const property = result.property;
            const score = result.score;
            const vibePct = Math.min(100, Math.round((result.breakdown.vibe / 15) * 100));
            const groupPct = Math.min(100, Math.round((result.breakdown.capacity / 20) * 100));
            const budgetPct = Math.min(100, Math.round((result.breakdown.budget / 15) * 100));
            const isSaved = savedProperties.includes(property.id);

            return (
              <View key={property.id} style={styles.card}>
                {/* Photo Area */}
                <View style={styles.photoArea}>
                  {property.photos && property.photos.length > 0 ? (
                    <Image
                      source={{ uri: property.photos[0] }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Feather name="home" size={48} color="#1A6B5A" />
                    </View>
                  )}

                  {/* Top-Left Badge */}
                  <View style={styles.badgeContainer}>
                    <Feather name="star" size={12} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.badgeText}>
                      {index === 0 ? 'BEST MATCH' : 'GREAT MATCH'}
                    </Text>
                  </View>

                  {/* Top-Right Circular Match Score */}
                  <View style={[styles.scoreRing, getProgressBorderColor(score)]}>
                    <Text style={styles.scoreValue}>{score.toFixed(0)}%</Text>
                    <Text style={styles.scoreText}>MATCH</Text>
                  </View>
                </View>

                {/* Content Area */}
                <View style={styles.contentArea}>
                  {/* Property Info Row (Name + Price) */}
                  <View style={styles.propertyInfoRow}>
                    <Text style={styles.propertyName} numberOfLines={1}>
                      {property.name}
                    </Text>
                    <View style={styles.priceCol}>
                      <Text style={styles.propertyPrice}>
                        ₹{result.priceBreakdown.grandTotal.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.nightsText}>
                        for {result.priceBreakdown.nights} {result.priceBreakdown.nights === 1 ? 'night' : 'nights'}
                      </Text>
                    </View>
                  </View>

                  {/* Location Row */}
                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={14} color="#6B7370" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {property.location?.city}, {property.location?.state}
                    </Text>
                  </View>

                  {/* Amenity Chips (WiFi, TV, Hot Water - max 3) */}
                  {property.amenities && property.amenities.length > 0 && (
                    <View style={styles.amenitiesRow}>
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <View key={amenity} style={styles.amenityChip}>
                          <Feather name={getAmenityIconName(amenity)} size={12} color="#1A1F1E" />
                          <Text style={styles.amenityChipText}>
                            {amenity.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Match Reasons Chips (Orange) */}
                  {result.matchReasons && result.matchReasons.length > 0 && (
                    <View style={styles.matchReasonsRow}>
                      {result.matchReasons.map((reason, idx) => (
                        <View key={idx} style={styles.matchReasonChip}>
                          <Feather name={getReasonIconName(idx)} size={12} color="#D4704A" />
                          <Text style={styles.matchReasonChipText}>
                            {reason}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Score Breakdown Section */}
                  <View style={styles.breakdownSection}>
                    {/* Vibe Match */}
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabelCol}>
                        <Feather name="heart" size={14} color="#6B7370" />
                        <Text style={styles.breakdownLabelText}>Vibe Match</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${vibePct}%` }]} />
                      </View>
                      <Text style={styles.breakdownValueText}>{vibePct}%</Text>
                    </View>

                    {/* Group Fit */}
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabelCol}>
                        <Feather name="users" size={14} color="#6B7370" />
                        <Text style={styles.breakdownLabelText}>Group Fit</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${groupPct}%` }]} />
                      </View>
                      <Text style={styles.breakdownValueText}>{groupPct}%</Text>
                    </View>

                    {/* Budget Fit */}
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabelCol}>
                        <Feather name="credit-card" size={14} color="#6B7370" />
                        <Text style={styles.breakdownLabelText}>Budget Fit</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${budgetPct}%` }]} />
                      </View>
                      <Text style={styles.breakdownValueText}>{budgetPct}%</Text>
                    </View>
                  </View>

                  {/* Bottom Action Row */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewProperty(property.id, result.matchReasons)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewButtonText}>
                        View Property →
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveCircleButton}
                      onPress={() => handleSave(property.id)}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name="heart" 
                        size={20} 
                        color={isSaved ? "#D4704A" : "#6B7370"} 
                        fill={isSaved ? "#D4704A" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
