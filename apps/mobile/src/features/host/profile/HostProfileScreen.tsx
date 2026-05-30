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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { auth } from '../../../services/firebase';
import { useAuthStore } from '../../../stores/authStore';
import i18n from '../../../locales/i18n';
import styles from './HostProfileScreen.styles';

type TabType = 'PROFILE' | 'PROPERTIES' | 'REVIEWS' | 'SETTINGS';

interface PropertyItem {
  id: string;
  name: string;
  location: string;
  bookings: number;
  status: 'ACTIVE' | 'DRAFT';
}

interface ReviewItem {
  id: string;
  rating: string;
  date: string;
  text: string;
}

export default function HostProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const userName = user?.name ?? 'Host';
  const [activeTab, setActiveTab] = useState<TabType>('PROFILE');

  const tabs: TabType[] = ['PROFILE', 'PROPERTIES', 'REVIEWS', 'SETTINGS'];

  const properties: PropertyItem[] = [
    { id: '1', name: 'Hillside Retreat', location: 'Manali, HP', bookings: 4, status: 'ACTIVE' },
    { id: '2', name: 'Urban Sanctuary', location: 'Bengaluru, KA', bookings: 8, status: 'ACTIVE' },
  ];

  const reviews: ReviewItem[] = [
    { id: '1', rating: '5.0 ⭐', date: 'Oct 10, 2026', text: 'Loved the hospitality! The local farm breakfast was incredible, and the host was very kind.' },
    { id: '2', rating: '4.5 ⭐', date: 'Sep 24, 2026', text: 'Stunning fireplace cabin. Highly recommend for peace seekers.' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  const handleEdit = (section: string) => {
    Alert.alert('Edit Section', `Editing ${section}...`);
  };

  const handleSwitchToGuest = () => {
    // Navigate back to the GuestNavigator
    navigation.navigate('Guest' as any);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('user_full_name');
      await AsyncStorage.removeItem('user_phone_number');
      useAuthStore.getState().clearUser();
      navigation.replace('Auth');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <MaterialCommunityIcons name="leaf" size={18} color="#84C9BA" />
          <Text style={styles.topBarText}>{i18n.t('host.profile.title')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <View style={styles.verifiedChip}>
              <Feather name="check-circle" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedChipText}>{i18n.t('host.profile.verifiedHost')}</Text>
            </View>
          </View>

          {/* Tab Row */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {i18n.t(`host.profile.tab${tab.charAt(0) + tab.slice(1).toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content Area */}
          <View style={styles.tabContent}>
            {/* PROFILE TAB */}
            {activeTab === 'PROFILE' && (
              <View>
                {/* Bio */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>{i18n.t('host.profile.hostBio')}</Text>
                  <TouchableOpacity onPress={() => handleEdit('Bio')}>
                    <Text style={styles.sectionAction}>{i18n.t('host.profile.edit')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.bioText}>
                  Welcome to my humble escapes! I love introducing travellers to Indian hospitality, organic cooking, and local trails.
                </Text>

                {/* Story */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyReels')}</Text>
                  <TouchableOpacity onPress={() => handleEdit('Reels')}>
                    <Text style={styles.sectionAction}>{i18n.t('host.profile.edit')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.storyBox}>
                  <TouchableOpacity style={styles.storyPlayBtn} onPress={() => Alert.alert('Play Video', 'Playing host reels...')} activeOpacity={0.8}>
                    <Feather name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                {/* Payout Details */}
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>{i18n.t('host.profile.payoutDetails')}</Text>
                  <TouchableOpacity onPress={() => handleEdit('Payout')}>
                    <Text style={styles.sectionAction}>{i18n.t('host.profile.edit')}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.payoutRow} onPress={() => handleEdit('Bank')} activeOpacity={0.8}>
                  <View style={styles.payoutLeft}>
                    <Feather name="credit-card" size={20} color="#6B7370" />
                    <Text style={styles.payoutLabel}>UniCredit SPA</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#6B7370" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.payoutRow} onPress={() => handleEdit('UPI')} activeOpacity={0.8}>
                  <View style={styles.payoutLeft}>
                    <Feather name="dollar-sign" size={20} color="#6B7370" />
                    <Text style={styles.payoutLabel}>UPI ID</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.payoutVal}>@lakshaynagda</Text>
                    <Feather name="chevron-right" size={16} color="#6B7370" style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* PROPERTIES TAB */}
            {activeTab === 'PROPERTIES' && (
              <View>
                {properties.map((prop) => (
                  <View key={prop.id} style={styles.propertyCard}>
                    <View style={styles.propertyCardImgPlaceholder}>
                      <Feather name="home" size={24} color="#84C9BA" />
                    </View>
                    <View style={styles.propertyDetails}>
                      <Text style={styles.propertyName}>{prop.name}</Text>
                      <Text style={styles.propertyMeta}>{prop.location}</Text>
                    </View>
                    <View style={styles.propertyRight}>
                      <Text style={styles.propertyBookingsCount}>{prop.bookings} Booked</Text>
                      <View style={styles.propertyStatusChip}>
                        <Text style={styles.propertyStatusText}>{prop.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'REVIEWS' && (
              <View>
                {reviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewRating}>{rev.rating}</Text>
                      <Text style={styles.reviewDate}>{rev.date}</Text>
                    </View>
                    <Text style={styles.reviewText}>"{rev.text}"</Text>
                  </View>
                ))}
              </View>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'SETTINGS' && (
              <View>
                <View style={styles.settingsList}>
                  <TouchableOpacity style={styles.settingsRow} onPress={() => Alert.alert('Edit Profile', 'Edit Profile coming soon!')} activeOpacity={0.7}>
                    <Text style={styles.settingsLabel}>Edit Profile</Text>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsRow} onPress={() => Alert.alert('Notifications', 'Settings notifications coming soon!')} activeOpacity={0.7}>
                    <Text style={styles.settingsLabel}>Notifications</Text>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsRow} onPress={() => Alert.alert('Payout Settings', 'Payout configuration coming soon!')} activeOpacity={0.7}>
                    <Text style={styles.settingsLabel}>Payout Settings</Text>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsRow} onPress={() => Alert.alert('Help & Support', 'Help modules coming soon!')} activeOpacity={0.7}>
                    <Text style={styles.settingsLabel}>Help & Support</Text>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut} activeOpacity={0.7}>
                    <Text style={styles.signOutLabel}>Sign Out</Text>
                    <Text style={styles.chevron}>&gt;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Guest Mode Switcher Banner (Tabs PROFILE, PROPERTIES, REVIEWS only) */}
          {activeTab !== 'SETTINGS' && (
            <View style={styles.switchModeContainer}>
              <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchToGuest} activeOpacity={0.8}>
                <Text style={styles.switchBtnText}>{i18n.t('host.profile.switchGuest')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
