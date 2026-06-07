import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const [activeTab, setActiveTab] = useState<TabType>('trips');

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
            <Text style={styles.backArrow}>←</Text>
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
          {(!user || user.role === 'guest') ? (
            <View style={styles.hostBanner}>
              <View style={styles.hostBannerLeft}>
                <Text style={styles.hostBannerTitle}>
                  {i18n.t('profile.hostBannerTitle')}
                </Text>
                <Text style={styles.hostBannerSubtitle}>
                  {i18n.t('profile.hostBannerSubtitle')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.hostButton}
                onPress={() => navigation.navigate('HostOnboarding')}
                activeOpacity={0.8}
              >
                <Text style={styles.hostButtonText}>
                  {i18n.t('profile.becomeHost')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                style={[styles.hostButton, { backgroundColor: '#D4704A' }]}
                onPress={() => navigation.navigate('HostApp')}
                activeOpacity={0.8}
              >
                <Text style={styles.hostButtonText}>
                  Switch to Host
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
              <View style={styles.emptySavedContainer}>
                <Feather name="bookmark" size={32} color="#6B7370" />
                <Text style={styles.emptySavedTitle}>
                  {i18n.t('profile.noSaved')}
                </Text>
                <Text style={styles.emptySavedSubtitle}>
                  {i18n.t('profile.noSavedSub')}
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
