import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GuestTabParamList } from '../../navigation/GuestNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';
import { MatchedProperty } from '../../services/matchService';
import i18n from '../../locales/i18n';
import styles from './ProfileScreen.styles';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<GuestTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = 'trips' | 'saved' | 'how' | 'settings';

interface TabItem {
  key: TabType;
  label: string;
}

interface TripCardData {
  id: string;
  badgeText: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  imageBg: string;
}

interface HowStep {
  id: string;
  title: string;
  subtitle: string;
}

interface SettingsItem {
  id: string;
  label: string;
}

const getInitials = (name: string): string => {
  if (!name) return 'JU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, session } = useAuthStore();
  const userName = user?.name ?? 'Traveller';
  const isAlreadyHost = user?.role === 'host' || user?.role === 'both';
  const [activeTab, setActiveTab] = useState<TabType>('trips');
  const [savedProperties, setSavedProperties] = useState<MatchedProperty[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(false);

  const fetchSaved = async () => {
    try {
      setLoadingSaved(true);
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      
      const data = await apiService.get<MatchedProperty[]>(
        '/users/saved-properties', 
        token
      );
      setSavedProperties(data || []);
    } catch (err) {
      console.error('Failed to fetch saved properties:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'saved') {
      fetchSaved();
    }
  }, [activeTab]);

  const handleBecomeHost = () => {
    navigation.navigate('HostOnboarding');
  };

  const handleSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_id');
    } catch (err) {
      console.log('Error deleting token on sign out:', err);
    }
    useAuthStore.getState().clearAuth();
    navigation.replace('Auth');
  };

  const handleExplore = () => {
    navigation.navigate('Home');
  };

  const tabs: TabItem[] = [
    { key: 'trips', label: i18n.t('profile.trips') },
    { key: 'saved', label: i18n.t('profile.saved') },
    { key: 'how', label: i18n.t('profile.how') },
    { key: 'settings', label: 'settings' }, // label ignored for settings icon
  ];

  const tripsData: TripCardData[] = [
    {
      id: '1',
      badgeText: i18n.t('profile.upcoming'),
      badgeBg: '#1A6B5A',
      title: i18n.t('profile.trip1Title'),
      subtitle: i18n.t('profile.trip1Subtitle'),
      imageBg: '#1A6B5A',
    },
    {
      id: '2',
      badgeText: i18n.t('profile.completed'),
      badgeBg: '#2D8F5E',
      title: i18n.t('profile.trip2Title'),
      subtitle: i18n.t('profile.trip2Subtitle'),
      imageBg: '#D4704A',
    },
  ];

  const howSteps: HowStep[] = [
    {
      id: '1',
      title: i18n.t('profile.step1Title'),
      subtitle: i18n.t('profile.step1Sub'),
    },
    {
      id: '2',
      title: i18n.t('profile.step2Title'),
      subtitle: i18n.t('profile.step2Sub'),
    },
    {
      id: '3',
      title: i18n.t('profile.step3Title'),
      subtitle: i18n.t('profile.step3Sub'),
    },
  ];

  const settingsItems: SettingsItem[] = [
    { id: 'edit', label: i18n.t('profile.editProfile') },
    { id: 'notifications', label: i18n.t('profile.notifications') },
    { id: 'language', label: i18n.t('profile.language') },
    { id: 'privacy', label: i18n.t('profile.privacy') },
    { id: 'help', label: i18n.t('profile.help') },
    { id: 'terms', label: i18n.t('profile.terms') },
    { id: 'signout', label: i18n.t('profile.signOut') },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Bar Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBarLeft}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{i18n.t('auth.login.title')}</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{i18n.t('profile.memberBadge')}</Text>
            </View>
          </View>

          {/* Become a Host Banner */}
          {isAlreadyHost ? (
            <View style={styles.hostBanner}>
              <View style={styles.hostBannerLeft}>
                <Text style={styles.hostBannerTitle}>
                  Switch to Host Mode
                </Text>
                <Text style={styles.hostBannerSubtitle}>
                  Manage your listed properties and bookings.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.switchHostBtn}
                onPress={() => navigation.navigate('HostApp')}
                activeOpacity={0.8}
              >
                <Text style={styles.switchHostText}>
                  Switch to Host Mode
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.hostBanner}>
              <View style={styles.hostBannerLeft}>
                <Text style={styles.hostBannerTitle}>
                  Become a Host
                </Text>
                <Text style={styles.hostBannerSubtitle}>
                  Earn extra income by listing your property.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.becomeHostBtn}
                onPress={() => navigation.navigate('HostOnboarding')}
                activeOpacity={0.8}
              >
                <Text style={styles.becomeHostText}>
                  Become a Host
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tab Selector Bar */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  activeTab === tab.key && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                {tab.key === 'settings' ? (
                  <Feather 
                    name="settings" 
                    size={16} 
                    color={activeTab === 'settings' ? '#1A6B5A' : '#6B7370'} 
                  />
                ) : (
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === tab.key && styles.activeTabButtonText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content Area */}
          <View style={styles.tabContent}>
            {/* TAB 1: TRIPS */}
            {activeTab === 'trips' && (
              <View>
                {tripsData.map((trip) => (
                  <View key={trip.id} style={styles.tripCard}>
                    <View
                      style={[
                        styles.tripImagePlaceholder,
                        { backgroundColor: trip.imageBg },
                      ]}
                    >
                      <View
                        style={[
                          styles.tripBadge,
                          { backgroundColor: trip.badgeBg },
                        ]}
                      >
                        <Text style={styles.tripBadgeText}>{trip.badgeText}</Text>
                      </View>
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle}>{trip.title}</Text>
                      <Text style={styles.tripSubtitle}>{trip.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 2: SAVED */}
            {activeTab === 'saved' && (
              <View>
                {loadingSaved ? (
                  <ActivityIndicator size="small" color="#1A6B5A" style={{ marginVertical: 20 }} />
                ) : savedProperties.length === 0 ? (
                  <View style={styles.emptySavedContainer}>
                    <Feather name="bookmark" size={32} color="#6B7370" />
                    <Text style={styles.emptySavedTitle}>
                      No saved properties yet
                    </Text>
                    <Text style={styles.emptySavedSubtitle}>
                      Properties you save will appear here.
                    </Text>
                    <TouchableOpacity
                      style={styles.exploreButton}
                      onPress={handleExplore}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.exploreButtonText}>
                        {i18n.t('profile.explore')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  savedProperties.map((property) => {
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
                              onPress={() => navigation.navigate('HostPropertyDetail', { propertyId: property.id })}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.viewButtonText}>
                                {i18n.t('matches.viewProperty')}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.saveButton}
                              onPress={async () => {
                                try {
                                  const token = await SecureStore.getItemAsync('access_token');
                                  if (!token) return;
                                  await apiService.post('/users/save-property', { propertyId: property.id }, token);
                                  Alert.alert('Removed! ✓', 'Property removed from saved');
                                  fetchSaved();
                                } catch (error) {
                                  Alert.alert('Error', 'Could not remove');
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Feather name="bookmark" size={16} color="#1A6B5A" fill="#1A6B5A" />
                                <Text style={styles.saveButtonText}>Saved</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 3: HOW */}
            {activeTab === 'how' && (
              <View>
                <Text style={styles.howTitle}>
                  {i18n.t('profile.howTitle')}
                </Text>
                <View style={styles.howStepsContainer}>
                  {howSteps.map((step) => (
                    <View key={step.id} style={styles.howStepRow}>
                      <View style={styles.howStepIconContainer}>
                        {step.id === '1' && <Feather name="target" size={24} color="#1A6B5A" />}
                        {step.id === '2' && <MaterialCommunityIcons name="robot" size={24} color="#1A6B5A" />}
                        {step.id === '3' && <Feather name="check-circle" size={24} color="#1A6B5A" />}
                      </View>
                      <View style={styles.howStepTextContainer}>
                        <Text style={styles.howStepTitle}>{step.title}</Text>
                        <Text style={styles.howStepSubtitle}>
                          {step.subtitle}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <View style={styles.settingsList}>
                {settingsItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.settingsItem}
                    onPress={
                      item.id === 'signout'
                        ? handleSignOut
                        : () => {
                            Alert.alert(item.label, `${item.label} coming soon!`);
                          }
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingsItemLeft}>
                      {item.id === 'edit' && <Feather name="user" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'notifications' && <Feather name="bell" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'language' && <Feather name="globe" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'privacy' && <Feather name="lock" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'help' && <Feather name="help-circle" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'terms' && <Feather name="file-text" size={20} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'signout' && <Feather name="log-out" size={20} color="#D4704A" style={styles.settingsItemIcon} />}
                      <Text
                        style={[
                          styles.settingsItemLabel,
                          item.id === 'signout' && styles.signOutLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
