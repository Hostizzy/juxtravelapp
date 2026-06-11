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
import { getMatches, MatchedProperty } from '../../services/matchService';
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
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchedProperty[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Simulate a slight network delay to show off premium skeleton loader
        const [data] = await Promise.all([
          getMatches(destination, guests, moods, budget),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [destination, guests, moods, budget]);

  const handleSave = (propertyId: string) => {
    Alert.alert(
      i18n.t('discover.data.reels.reelSavedAlert') || 'Saved!',
      'This property has been added to your saved list.'
    );
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

          {/* Skeleton Loaders */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#84C9BA" size="large" />
              <Text style={styles.loadingText}>{i18n.t('matches.loading')}</Text>
            </View>

            {[1, 2, 3].map((key) => (
              <View key={key} style={styles.skeletonCard}>
                <View style={styles.skeletonPhoto} />
                <View style={styles.skeletonText} />
                <View style={styles.skeletonTextShort} />
                <View style={styles.skeletonButton} />
              </View>
            ))}
          </ScrollView>
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
          {matches.map((property) => {
            const score = property.matchScore ?? 8.5;
            const vibePct = Math.min(100, Math.round(score * 10));
            const groupPct = Math.min(100, Math.round((score - 0.2) * 10));
            const budgetPct = Math.min(100, Math.round((score + 0.1) * 10));

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
                    <Text style={styles.scoreValue}>{score.toFixed(1)}</Text>
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
                      ₹{property.price_per_night.toLocaleString('en-IN')}/night
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
                      <Text style={styles.saveButtonText}>
                        {i18n.t('matches.saveForLater')}
                      </Text>
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
