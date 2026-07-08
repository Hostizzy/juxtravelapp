import React, { useState, useEffect } from 'react';
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { useMyProperties } from '../../../hooks/useProperties';
import { useHostEarnings } from '../../../hooks/useBookings';
import { useConversations } from '../../../hooks/useConversations';
import { queryClient } from '../../../lib/queryClient';
import i18n from '../../../locales/i18n';
import styles from './HostProfileScreen.styles';

type TabType = 'PROFILE' | 'PROPERTIES' | 'REVIEWS' | 'SETTINGS';

export default function HostProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const userName = user?.name ?? 'Host';
  const isVerified = (user as any)?.host_profile?.verified ?? true;

  const [activeTab, setActiveTab] = useState<TabType>('PROFILE');
  const { data: properties = [], isLoading: loadingProps } = useMyProperties();
  const { data: earningsData, isLoading: loadingEarnings } = useHostEarnings();
  const earnings = earningsData ?? { totalEarnings: 0, thisMonth: 0, pendingPayout: 0 };
  const { data: conversations = [] } = useConversations('host');
  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0
  );

  const tabs: { key: TabType; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'PROFILE', label: 'Profile', icon: 'user' },
    { key: 'PROPERTIES', label: 'Properties', icon: 'home' },
    { key: 'REVIEWS', label: 'Reviews', icon: 'star' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleEdit = (section: string) => {
    Alert.alert('Edit Section', `Editing ${section}...`);
  };

  const handleSwitchToGuest = () => {
    navigation.navigate('Guest');
  };

  const handleSignOut = async () => {
    try {
      queryClient.clear();
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_id');
      await AsyncStorage.removeItem('user_full_name');
      await AsyncStorage.removeItem('user_phone_number');
      useAuthStore.getState().clearAuth();
      navigation.replace('Auth');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  const propertiesWithReels = properties.filter((p) => p.reels && p.reels.length > 0);

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        
        {/* HERO HEADER */}
        <View style={styles.heroHeader}>
          {/* Subtle Dimmed Background image */}
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' }}
            style={styles.heroBgImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            {/* Logo & Notification Bell */}
            <View style={styles.topRow}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="leaf" size={18} color="#1A6B5A" />
                <Text style={styles.logoText}>JuxTravel Host</Text>
              </View>
              <TouchableOpacity 
                style={styles.bellBtn} 
                onPress={() => Alert.alert('Notifications', `You have ${unreadCount} unread messages.`)} 
                activeOpacity={0.7}
              >
                <Feather name="bell" size={20} color="#1A1F1E" />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Avatar and Verification */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                </View>
                <View style={styles.checkBadge}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.profileName}>{userName}</Text>
              
              {isVerified ? (
                <View style={[styles.verifiedPill, styles.verifiedActive]}>
                  <Feather name="check" size={10} color="#1A6B5A" style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedText}>VERIFIED HOST</Text>
                </View>
              ) : (
                <View style={[styles.verifiedPill, styles.verifiedPending]}>
                  <Text style={styles.verifiedTextPending}>Pending Verification</Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>

        {/* Tab Row */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Feather 
                  name={tab.icon} 
                  size={16} 
                  color={isActive ? '#1A6B5A' : '#6B7370'} 
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tabContent}>
            
            {/* PROFILE TAB */}
            {activeTab === 'PROFILE' && (
              <View>
                {/* Host Bio */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>HOST BIO</Text>
                  <TouchableOpacity onPress={() => handleEdit('Bio')}>
                    <Text style={styles.sectionAction}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>
                    Welcome to my humble escapes! I love introducing travellers to Indian hospitality, organic cooking, and local trails.
                  </Text>
                  <MaterialCommunityIcons name="leaf" size={48} color="#E6F2EF" style={styles.bioLeafIcon} />
                </View>

                {/* Reels Section */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyReels') || 'PROPERTY REELS'}</Text>
                  <TouchableOpacity onPress={() => handleEdit('Reels')}>
                    <Text style={styles.sectionAction}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {propertiesWithReels.length > 0 ? (
                  <View style={styles.reelsContainer}>
                    <Text style={styles.reelsCaption}>See your property in action</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {propertiesWithReels.map((p) => (
                        <TouchableOpacity 
                          key={p.id} 
                          style={styles.storyBox} 
                          onPress={() => Alert.alert('Play Video', `Playing reels for ${p.name}...`)} 
                          activeOpacity={0.8}
                        >
                          <Image 
                            source={{ uri: p.photos[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' }} 
                            style={styles.storyImage} 
                          />
                          <View style={styles.storyOverlay}>
                            <TouchableOpacity style={styles.storyPlayBtn} activeOpacity={0.8}>
                              <Feather name="play" size={20} color="#FFFFFF" style={styles.playIcon} />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.storyTitle} numberOfLines={1}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={styles.storyBoxLargeContainer}>
                    <TouchableOpacity 
                      style={styles.storyBoxLarge} 
                      onPress={() => Alert.alert('Play Video', 'Playing reels...')}
                      activeOpacity={0.85}
                    >
                      <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800' }} 
                        style={styles.storyImageLarge} 
                        resizeMode="cover"
                      />
                      <View style={styles.storyOverlayLarge}>
                        <View style={styles.storyPlayBtnLarge}>
                          <Feather name="play" size={24} color="#1A6B5A" style={{ marginLeft: 2 }} />
                        </View>
                        <Text style={styles.storyTitleLarge}>See your property in action</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Payout Details */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>{i18n.t('host.profile.payoutDetails') || 'PAYOUT DETAILS'}</Text>
                  <TouchableOpacity onPress={() => handleEdit('Payout')}>
                    <Text style={styles.sectionAction}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {loadingEarnings ? (
                  <ActivityIndicator size="small" color="#1A6B5A" style={{ marginVertical: 12 }} />
                ) : (
                  <View style={styles.earningsCard}>
                    <View style={styles.earningsCol}>
                      <MaterialCommunityIcons name="wallet-outline" size={20} color="#1A6B5A" style={{ marginBottom: 6 }} />
                      <Text style={styles.earningsLbl}>Total Earnings</Text>
                      <Text style={styles.earningsVal}>₹{earnings.totalEarnings.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsCol}>
                      <Feather name="calendar" size={20} color="#1A6B5A" style={{ marginBottom: 6 }} />
                      <Text style={styles.earningsLbl}>This Month</Text>
                      <Text style={styles.earningsVal}>₹{earnings.thisMonth.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsCol}>
                      <Feather name="credit-card" size={20} color="#1A6B5A" style={{ marginBottom: 6 }} />
                      <Text style={styles.earningsLbl}>Pending Payout</Text>
                      <Text style={styles.earningsVal}>₹{earnings.pendingPayout.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                )}

                {/* Complete your profile CTA */}
                <View style={styles.ctaCard}>
                  <View style={styles.ctaIconCircle}>
                    <Feather name="shield" size={20} color="#1A6B5A" />
                  </View>
                  <View style={styles.ctaMeta}>
                    <Text style={styles.ctaTitle}>Complete your profile</Text>
                    <Text style={styles.ctaSubtitle}>Add more details to build trust with travellers and get more bookings.</Text>
                  </View>
                  <TouchableOpacity style={styles.ctaButton} onPress={() => handleEdit('CompleteProfile')} activeOpacity={0.8}>
                    <Text style={styles.ctaButtonText}>Complete Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* PROPERTIES TAB */}
            {activeTab === 'PROPERTIES' && (
              <View>
                {loadingProps ? (
                  <ActivityIndicator color="#1A6B5A" size="small" />
                ) : properties.length === 0 ? (
                  <View style={styles.emptyProperties}>
                    <Feather name="home" size={32} color="#6B7370" />
                    <Text style={styles.emptyText}>No properties yet</Text>
                    <Text style={styles.emptySubText}>Tap + to list your first property</Text>
                  </View>
                ) : (
                  properties.map((property) => (
                    <TouchableOpacity
                      key={property.id}
                      style={styles.propertyCard}
                      onPress={() => navigation.navigate('HostPropertyDetail', { propertyId: property.id })}
                      activeOpacity={0.8}
                    >
                      {property.photos && property.photos.length > 0 ? (
                        <Image
                          source={{ uri: property.photos[0] }}
                          style={styles.propertyCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.propertyCardImagePlaceholder}>
                          <Feather name="home" size={32} color="#1A6B5A" />
                        </View>
                      )}
                      
                      <View style={[
                        styles.statusBadge,
                        property.status === 'active' 
                          ? styles.statusActive
                          : property.status === 'under_review'
                          ? styles.statusReview
                          : styles.statusDraft
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          property.status === 'active'
                          ? styles.statusActiveText
                          : property.status === 'under_review'
                          ? styles.statusReviewText
                          : styles.statusDraftText
                        ]}>
                          {property.status === 'active' 
                            ? 'ACTIVE'
                            : property.status === 'under_review'
                            ? 'IN REVIEW'
                            : 'DRAFT'}
                        </Text>
                      </View>

                      <Text style={styles.propertyCardName} numberOfLines={1}>{property.name}</Text>
                      <Text style={styles.propertyCardLocation} numberOfLines={1}>
                        {property.location?.city}, {property.location?.state}
                      </Text>
                      <Text style={styles.propertyCardPrice}>
                        ₹{property.price_per_night.toLocaleString('en-IN')}/night
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'REVIEWS' && (
              <View style={styles.emptyReviewsContainer}>
                <Feather name="star" size={32} color="#6B7370" />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              </View>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'SETTINGS' && (
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingsRow} onPress={handleSwitchToGuest} activeOpacity={0.7}>
                  <View style={styles.settingsLeft}>
                    <Feather name="repeat" size={18} color="#1A1F1E" style={{ marginRight: 12 }} />
                    <Text style={styles.settingsLabel}>Switch to Guest Mode</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#6B7370" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut} activeOpacity={0.7}>
                  <View style={styles.settingsLeft}>
                    <Feather name="log-out" size={18} color="#D4704A" style={{ marginRight: 12 }} />
                    <Text style={styles.signOutLabel}>Sign Out</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#6B7370" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
