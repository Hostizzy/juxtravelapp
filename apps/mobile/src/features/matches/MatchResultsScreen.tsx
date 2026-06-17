import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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

  // Animation Refs
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loaderRotateAnim = useRef(new Animated.Value(0)).current;
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;

  // AI Concierge loader animation loops
  useEffect(() => {
    if (!loading) return;

    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const loaderRotateLoop = Animated.loop(
      Animated.timing(loaderRotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loaderRotateLoop.start();

    const floatAnim = (val: Animated.Value, range: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: -range,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const float1 = floatAnim(particle1Y, 12, 2200);
    const float2 = floatAnim(particle2Y, 16, 2800);
    float1.start();
    float2.start();

    return () => {
      orbitLoop.stop();
      pulseLoop.stop();
      loaderRotateLoop.stop();
      float1.stop();
      float2.stop();
    };
  }, [loading]);

  // Steps checklist increment intervals (1000ms each)
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
      }, 1000);
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
          new Promise((resolve) => setTimeout(resolve, 100)), // Short delay since PlanProcessingScreen already showed steps
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
      {
        title: 'Analyzing travel preferences...',
        helper: 'Understanding your taste and style',
      },
      {
        title: `Scoring active properties in ${destination || 'Goa'}...`,
        helper: 'Evaluating top-rated stays',
      },
      {
        title: `Filtering by ₹${budget.toLocaleString('en-IN')} budget...`,
        helper: 'Finding best value for your money',
      },
      {
        title: `Matching group fit for ${guests} guest${guests !== 1 ? 's' : ''}...`,
        helper: 'Ensuring the perfect experience',
      },
      {
        title: 'Polishing your personalized concierge matches...',
        helper: 'Adding final magic ✨',
      },
    ];

    const orbitRotation = orbitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const loaderRotation = loaderRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Top Bar */}
          <View style={[styles.topBar, { backgroundColor: '#F8F7F3' }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color="#1A1F1E" />
            </TouchableOpacity>
            <Text style={[styles.topBarTitle, { color: '#1A1F1E' }]}>Concierge Search</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.conciergeLoadingContainer}>
            {/* AI Hero Area */}
            <View style={styles.heroArea}>
              {/* Glow outer ring */}
              <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />

              {/* Orbit border ring */}
              <View style={styles.orbitRing} />

              {/* Orbit riding dot */}
              <Animated.View style={[styles.orbitContainer, { transform: [{ rotate: orbitRotation }] }]}>
                <View style={styles.orbitDot} />
              </Animated.View>

              {/* Center Canvas */}
              <View style={styles.centerCanvas}>
                {/* Cloud Decor */}
                <Feather name="cloud" size={16} color="#A0D1C5" style={styles.decorCloud} />
                
                {/* Palm Silhouettes */}
                <MaterialCommunityIcons name="palm-tree" size={54} color="#A7DED1" style={styles.decorPalm} />
                <MaterialCommunityIcons name="palm-tree" size={42} color="#A7DED1" style={styles.decorPalmRight} />

                {/* Suitcase Illustration */}
                <View style={styles.decorSuitcase}>
                  <View style={styles.suitcaseHandle} />
                  <View style={styles.suitcaseBody}>
                    <View style={styles.suitcaseStrapLeft} />
                    <View style={styles.suitcaseStrapRight} />
                    <View style={styles.suitcaseBadge}>
                      <Feather name="feather" size={10} color="#1B7A69" />
                    </View>
                  </View>
                  <View style={styles.suitcaseWheelsRow}>
                    <View style={styles.suitcaseWheel} />
                    <View style={styles.suitcaseWheel} />
                  </View>
                </View>
              </View>

              {/* Floating particles */}
              <Animated.View style={[styles.floatingParticle, { top: 30, left: 16, transform: [{ translateY: particle1Y }] }]} />
              <Animated.View style={[styles.floatingParticle, { bottom: 40, right: 10, transform: [{ translateY: particle2Y }] }]} />
            </View>

            <Text style={styles.loadingTitle}>Generating Your Escape...</Text>
            <Text style={styles.loadingSubtitle}>AI Match Engine is curating your perfect matches</Text>

            <View style={styles.checklistWrapper}>
              {checklistItems.map((item, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const isLast = index === checklistItems.length - 1;

                return (
                  <View key={index} style={[styles.checklistItem, isLast && styles.checklistItemLast]}>
                    {/* Dotted vertical connector lines */}
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalLine,
                          isCompleted && styles.verticalLineActive,
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.checkIcon,
                        isCompleted && styles.checkIconCompleted,
                        isActive && styles.checkIconActive,
                      ]}
                    >
                      {isCompleted ? (
                        <Feather name="check" size={14} color="#1B7A69" />
                      ) : isActive ? (
                        <Animated.View style={{ transform: [{ rotate: loaderRotation }] }}>
                          <Feather name="loader" size={12} color="#D67A4A" />
                        </Animated.View>
                      ) : (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#E6E8E5' }} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text 
                        style={[
                          styles.checklistText,
                          isCompleted && styles.checklistTextCompleted,
                          isActive && styles.checklistTextActive
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text 
                        style={[
                          styles.helperText,
                          isCompleted && styles.helperTextCompleted,
                          isActive && styles.helperTextActive
                        ]}
                      >
                        {item.helper}
                      </Text>
                    </View>
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
                          name="heart" 
                          size={16} 
                          color={savedProperties.includes(property.id) ? "#D4704A" : "#1A1F1E"} 
                          fill={savedProperties.includes(property.id) ? "#D4704A" : "transparent"}
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
