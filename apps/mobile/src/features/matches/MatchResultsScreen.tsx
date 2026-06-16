import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getMatches, MatchResult, MatchedProperty } from '../../services/matchService';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../services/api';
import i18n from '../../locales/i18n';
import styles from './MatchResultsScreen.styles';

type MatchResultsScreenRouteProp = RouteProp<RootStackParamList, 'MatchResults'>;

type MatchResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
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
    groupType,
    moods,
    budget,
    freeText,
    bedrooms,
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 4) {
            return prev + 1;
          }
          return prev;
        });
      }, 400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    const fetchMatchesAndSaved = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('access_token');
        const [data, savedData] = await Promise.all([
          getMatches(destination, checkIn, checkOut, guests, bedrooms, groupType, moods, budget),
          token ? apiService.get<MatchedProperty[]>('/users/saved-properties', token).catch(() => []) : [],
          new Promise((resolve) => setTimeout(resolve, 2200)), // Extends display time for AI generation steps
        ]);
        setMatches(data);
        setSavedProperties((savedData || []).map(p => p.id));
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchesAndSaved();
  }, [destination, checkIn, checkOut, guests, bedrooms, groupType, moods, budget]);

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

  const handleViewProperty = (propertyId: string) => {
    navigation.navigate('HostPropertyDetail', {
      propertyId,
      checkIn,
      checkOut,
      guests,
    });
  };

  if (loading) {
    const checklistItems = [
      'Analyzing travel preferences...',
      `Scoring active properties in ${destination}...`,
      `Filtering by ₹${budget.toLocaleString('en-IN')} budget...`,
      `Matching group fit for ${guests} guests...`,
      'Polishing your personalized concierge matches...',
    ];

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
            <Text style={styles.topBarTitle}>Concierge Search</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.conciergeLoadingContainer}>
            <ActivityIndicator color="#1A6B5A" size="large" style={styles.loaderSpinner} />
            <Text style={styles.loadingTitle}>Generating Your Escape...</Text>
            <Text style={styles.loadingSubtitle}>AI Match Engine is curating your perfect matches</Text>

            <View style={styles.checklistWrapper}>
              {checklistItems.map((item, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                
                return (
                  <View key={index} style={styles.checklistItem}>
                    {isCompleted ? (
                      <Feather name="check-circle" size={18} color="#1A6B5A" style={styles.checkIcon} />
                    ) : isActive ? (
                      <ActivityIndicator size="small" color="#D4704A" style={styles.checkIcon} />
                    ) : (
                      <Feather name="circle" size={18} color="#6B7370" style={styles.checkIcon} />
                    )}
                    <Text 
                      style={[
                        styles.checklistText,
                        isCompleted && styles.checklistTextCompleted,
                        isActive && styles.checklistTextActive
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (matches.length === 0) {
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
            <Text style={styles.topBarTitle}>{i18n.t('matches.title')}</Text>
            <View style={styles.topBarSpacer} />
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
        </SafeAreaView>
      </View>
    );
  }

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
          <Text style={styles.topBarTitle}>{i18n.t('matches.title')}</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              {i18n.t('matches.found', { count: matches.length })}
            </Text>
            <Text style={styles.heroSubtitle}>
              {i18n.t('matches.basedOn')} {destination}
            </Text>
            <View style={styles.moodsRow}>
              {moods.map((mood) => (
                <View key={mood} style={styles.moodChip}>
                  <Text style={styles.moodChipText}>
                    {i18n.t(`plan.step3.${mood}`) || mood.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Matches List */}
          {matches.map((result) => {
            const property = result.property;
            const score = result.score;
            const vibePct = Math.min(100, Math.round((result.breakdown.vibe / 15) * 100));
            const groupPct = Math.min(100, Math.round((result.breakdown.capacity / 20) * 100));
            const budgetPct = Math.min(100, Math.round((result.breakdown.budget / 15) * 100));

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
                      <Feather name="home" size={48} color="#84C9BA" />
                    </View>
                  )}

                  {/* Match Score Badge */}
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreValue}>{score.toFixed(0)}%</Text>
                    <Text style={styles.scoreText}>{i18n.t('matches.matchScore')}</Text>
                  </View>
                </View>

                {/* Content Area */}
                <View style={styles.contentArea}>
                  {/* Row 1: Name + Price */}
                  <View style={styles.row1}>
                    <Text style={styles.propertyName} numberOfLines={1}>
                      {property.name}
                    </Text>
                    <Text style={styles.propertyPrice}>
                      ₹{result.priceBreakdown.grandTotal.toLocaleString('en-IN')} for {result.priceBreakdown.nights} {result.priceBreakdown.nights === 1 ? 'night' : 'nights'}
                    </Text>
                  </View>

                  {/* Row 2: Location */}
                  <View style={styles.row2}>
                    <Feather name="map-pin" size={14} color="#6B7370" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {property.location?.city}, {property.location?.state}
                    </Text>
                  </View>

                  {/* Row 3: Amenities (max 3) */}
                  {property.amenities && property.amenities.length > 0 && (
                    <View style={styles.row3}>
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <View key={amenity} style={styles.amenityChip}>
                          <Text style={styles.amenityChipText}>
                            {amenity.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Match Reasons Chips */}
                  {result.matchReasons && result.matchReasons.length > 0 && (
                    <View style={[styles.row3, { marginTop: 4, marginBottom: 12 }]}>
                      {result.matchReasons.map((reason, idx) => (
                        <View key={idx} style={[styles.amenityChip, { backgroundColor: '#F5E6D0', borderColor: '#D4704A', borderWidth: 1 }]}>
                          <Text style={[styles.amenityChipText, { color: '#D4704A', fontWeight: '700' }]}>
                            {reason}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Row 4: Match Breakdown */}
                  <View style={styles.row4}>
                    {/* Vibe Match */}
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>{i18n.t('matches.vibeMatch')}</Text>
                      <View style={styles.breakdownBarContainer}>
                        <View
                          style={[styles.breakdownBar, { width: `${vibePct}%` }]}
                        />
                      </View>
                    </View>

                    {/* Group Fit */}
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>{i18n.t('matches.groupFit')}</Text>
                      <View style={styles.breakdownBarContainer}>
                        <View
                          style={[styles.breakdownBar, { width: `${groupPct}%` }]}
                        />
                      </View>
                    </View>

                    {/* Budget Fit */}
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>{i18n.t('matches.budgetFit')}</Text>
                      <View style={styles.breakdownBarContainer}>
                        <View
                          style={[styles.breakdownBar, { width: `${budgetPct}%` }]}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Row 5: Action Buttons */}
                  <View style={styles.row5}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewProperty(property.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewButtonText}>
                        {i18n.t('matches.viewProperty')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave(property.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Feather 
                          name="bookmark" 
                          size={16} 
                          color={savedProperties.includes(property.id) ? "#1A6B5A" : "#1A1F1E"} 
                          fill={savedProperties.includes(property.id) ? "#1A6B5A" : "transparent"}
                        />
                        <Text style={styles.saveButtonText}>
                          {savedProperties.includes(property.id) ? 'Saved' : i18n.t('matches.saveForLater')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
