import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { useNavigation, useRoute, useFocusEffect, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GuestTabParamList } from '../../navigation/GuestNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';
import { Property } from '../discover/DiscoverScreen';
import i18n from '../../locales/i18n';
import styles from './ProfileScreen.styles';
import { messageCache } from '../../services/messageCache';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<GuestTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = 'trips' | 'saved' | 'how' | 'settings';

interface TabItem {
  key: TabType;
  label: string;
}

interface SavedProperty extends Property {
  matchScore?: number;
}

interface Booking {
  id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  payment_id: string;
  created_at: string;
  property: {
    name: string;
    photos: string[];
    location: {
      city: string;
      state: string;
    };
    price_per_night: number;
  };
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

type ProfileRouteProp = RouteProp<
  GuestTabParamList & {
    Profile: { activeTab?: TabType };
  },
  'Profile'
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileRouteProp>();
  const { user, session } = useAuthStore();
  const userName = user?.name ?? 'Traveller';
  const isAlreadyHost = user?.role === 'host' || user?.role === 'both';
  const [activeTab, setActiveTab] = useState<TabType>('trips');
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [trips, setTrips] = useState<Booking[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [tripsLoading, setTripsLoading] = useState(false);

  const tripsCount = trips.length;
  const savedCount = savedProperties.length;
  const pointsTotal = trips.filter(
    (t) => t.status === 'confirmed' || t.status === 'completed'
  ).length * 100;

  const fetchSaved = async (force = false) => {
    if (savedLoaded && !force) return;
    setSavedLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        console.log('No token for saved fetch');
        return;
      }

      console.log('Fetching saved properties...');
      const data = await apiService.get<SavedProperty[]>(
        '/users/saved-properties',
        token
      );
      console.log('Saved properties received:', data?.length);
      setSavedProperties(data ?? []);
      setSavedLoaded(true);
    } catch (error) {
      console.log('Fetch saved error:', error);
    } finally {
      setSavedLoading(false);
    }
  };

  const fetchTrips = async (force = false) => {
    if (tripsLoaded && !force) return;
    setTripsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;

      const data = await apiService.get<Booking[]>(
        '/bookings/my-bookings',
        token
      );
      setTrips(data ?? []);
      setTripsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  React.useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      fetchSaved();
      fetchTrips();
    }, [savedLoaded, tripsLoaded])
  );

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
    messageCache.clearAll();
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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>JuxTravel</Text>

            <View style={styles.headerRightIcons}>
              <TouchableOpacity 
                style={styles.headerIconBtn} 
                activeOpacity={0.7} 
                onPress={() => Alert.alert('Notifications', 'No new notifications.')}
              >
                <Feather name="bell" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={activeTab === 'saved' ? savedLoading : activeTab === 'trips' ? tripsLoading : false}
              onRefresh={() => {
                if (activeTab === 'saved') fetchSaved(true);
                if (activeTab === 'trips') fetchTrips(true);
              }}
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton} 
                activeOpacity={0.8} 
                onPress={() => Alert.alert('Edit Photo', 'Upload functionality coming soon!')}
              >
                <Feather name="edit-2" size={12} color="#1A6B5A" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              
              <View style={styles.memberChip}>
                <Feather name="award" size={10} color="#1A6B5A" />
                <Text style={styles.memberChipText}>{i18n.t('profile.memberBadge')}</Text>
              </View>

              <Text style={styles.joinedText}>
                Joined June 2026  •  Member since 2 months
              </Text>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statColumn}>
              <View style={styles.statHeader}>
                <Feather name="briefcase" size={14} color="#1A6B5A" />
                <Text style={styles.statValue}>{tripsCount}</Text>
              </View>
              <Text style={styles.statLabel}>Trips</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <View style={styles.statHeader}>
                <Feather name="heart" size={14} color="#D4704A" />
                <Text style={styles.statValue}>{savedCount}</Text>
              </View>
              <Text style={styles.statLabel}>Saved</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <View style={styles.statHeader}>
                <Feather name="star" size={14} color="#5E5ADB" />
                <Text style={styles.statValue}>{pointsTotal}</Text>
              </View>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>

          {/* Become a Host / Switch to Host Mode Card */}
          <View style={styles.hostCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' }} 
              style={styles.hostCardImageBg}
              resizeMode="cover"
            />
            
            <View style={styles.hostCardHeader}>
              <Text style={styles.hostCardTag}>✦ HOSTING</Text>
            </View>

            {isAlreadyHost ? (
              <>
                <Text style={styles.hostCardTitle}>Switch to Host Mode</Text>
                <Text style={styles.hostCardDesc}>
                  Manage your listings and reservations on JuxTravel.
                </Text>
                <TouchableOpacity 
                  style={styles.hostCardCTA} 
                  activeOpacity={0.85} 
                  onPress={() => navigation.navigate('HostApp')}
                >
                  <Text style={styles.hostCardCTAText}>Switch to Host Mode →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.hostCardTitle}>Become a Host</Text>
                <Text style={styles.hostCardDesc}>
                  Earn income by listing your property on JuxTravel.
                </Text>
                <TouchableOpacity 
                  style={styles.hostCardCTA} 
                  activeOpacity={0.85} 
                  onPress={handleBecomeHost}
                >
                  <Text style={styles.hostCardCTAText}>Become a Host →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

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
                {(tripsLoading && !tripsLoaded) ? (
                  <ActivityIndicator size="small" color="#1A6B5A" style={{ marginVertical: 20 }} />
                ) : trips.length === 0 ? (
                  <View style={styles.emptySavedContainer}>
                    <Feather name="briefcase" size={32} color="#6B7370" style={{ marginBottom: 12 }} />
                    <Text style={styles.emptySavedTitle}>
                      No bookings found
                    </Text>
                    <Text style={styles.emptySavedSubtitle}>
                      Once you book a stay, your upcoming and completed trips will appear here.
                    </Text>
                    <TouchableOpacity
                      style={styles.exploreButton}
                      onPress={handleExplore}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.exploreButtonText}>
                        Start Planning
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  trips.map((trip) => {
                    const checkInDate = trip.check_in ? new Date(trip.check_in) : null;
                    const checkOutDate = trip.check_out ? new Date(trip.check_out) : null;
                    const dateStr = (checkInDate && checkOutDate)
                      ? `${checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'Dates flexible';

                    return (
                      <TouchableOpacity
                        key={trip.id}
                        style={styles.tripCard}
                        activeOpacity={0.9}
                        onPress={() => {
                          navigation.navigate('BookingDetail', { bookingId: trip.id });
                        }}
                      >
                        <View style={styles.tripImageContainer}>
                          <Image 
                            source={{ uri: trip.property?.photos?.[0] || 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' }} 
                            style={styles.tripImage}
                            resizeMode="cover"
                          />
                          <View style={[
                            styles.tripStatusBadge, 
                            { 
                              backgroundColor: 
                                trip.status === 'confirmed' ? '#1A6B5A' :
                                trip.status === 'completed' ? '#2E7D32' :
                                trip.status === 'cancelled' ? '#C62828' : '#F57C00' 
                            }
                          ]}>
                            <Text style={styles.tripStatusText}>{trip.status.toUpperCase()}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.tripInfo}>
                          <Text style={styles.tripTitle}>{trip.property?.name || 'Beautiful Stay'}</Text>
                          <View style={styles.tripDetailsRow}>
                            <Feather name="map-pin" size={12} color="#6B7370" />
                            <Text style={styles.tripDetailsText}>{trip.property?.location?.city || 'India'}</Text>
                          </View>
                          <View style={styles.tripDetailsRow}>
                            <Feather name="calendar" size={12} color="#6B7370" />
                            <Text style={styles.tripDetailsText}>{dateStr}  •  {trip.guests ?? 1} {trip.guests === 1 ? 'Guest' : 'Guests'}</Text>
                          </View>
                          <View style={styles.tripActionRow}>
                            <View style={styles.tripCTA}>
                              <Text style={styles.tripCTAText}>View Stay Details</Text>
                              <Feather name="chevron-right" size={14} color="#1A6B5A" />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 2: SAVED */}
            {activeTab === 'saved' && (
              <View>
                {(savedLoading && !savedLoaded) ? (
                  <ActivityIndicator size="small" color="#1A6B5A" style={{ marginVertical: 20 }} />
                ) : savedProperties.length === 0 ? (
                  <View style={styles.emptySavedContainer}>
                    <Feather name="bookmark" size={32} color="#6B7370" style={{ marginBottom: 12 }} />
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
                  savedProperties.map((property) => (
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
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreValue}>{(property.matchScore ?? 8.5).toFixed(1)}</Text>
                          <Text style={styles.scoreText}>{i18n.t('matches.matchScore')}</Text>
                        </View>
                      </View>
                      <View style={styles.contentArea}>
                        <View style={styles.row1}>
                          <Text style={styles.propertyName} numberOfLines={1}>{property.name}</Text>
                          <Text style={styles.propertyPrice}>₹{property.price_per_night.toLocaleString('en-IN')}/night</Text>
                        </View>
                        <View style={styles.row5}>
                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => navigation.navigate('HostPropertyDetail', { propertyId: property.id })}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.viewButtonText}>{i18n.t('matches.viewProperty')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB 3: HOW */}
            {activeTab === 'how' && (
              <View>
                <Text style={styles.howTitle}>{i18n.t('profile.howTitle')}</Text>
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
                        <Text style={styles.howStepSubtitle}>{step.subtitle}</Text>
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
                      {item.id === 'edit' && <Feather name="user" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'notifications' && <Feather name="bell" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'language' && <Feather name="globe" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'privacy' && <Feather name="lock" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'help' && <Feather name="help-circle" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'terms' && <Feather name="file-text" size={18} color="#6B7370" style={styles.settingsItemIcon} />}
                      {item.id === 'signout' && <Feather name="log-out" size={18} color="#D4704A" style={styles.settingsItemIcon} />}
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
      </View>
    </View>
  );
}
