import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  ImageBackground,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useHostBookings } from '../../../hooks/useBookings';
import { useConversations } from '../../../hooks/useConversations';
import { apiGet } from '../../../lib/api';
import i18n from '../../../locales/i18n';
import styles from './HostBookingsScreen.styles';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HostBookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const horizontalScrollRef = useRef<ScrollView>(null);
  
  const { data: bookings = [], isLoading: loading, refetch } = useHostBookings();
  const { data: conversations = [] } = useConversations('host');
  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: i18n.t('host.bookings.tabAll') || 'All' },
    { key: 'upcoming', label: i18n.t('host.bookings.tabUpcoming') || 'Upcoming' },
    { key: 'completed', label: i18n.t('host.bookings.tabCompleted') || 'Completed' },
    { key: 'cancelled', label: i18n.t('host.bookings.tabCancelled') || 'Cancelled' },
  ];

  const handleTabPress = (index: number, key: TabType) => {
    setActiveTab(key);
    horizontalScrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return (
        ['pending', 'confirmed'].includes(b.status.toLowerCase()) &&
        new Date(b.check_in) >= new Date(new Date().setHours(0, 0, 0, 0))
      );
    }
    if (activeTab === 'completed') return b.status.toLowerCase() === 'completed';
    if (activeTab === 'cancelled') return b.status.toLowerCase() === 'cancelled';
    return true;
  });

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'completed':
        return { bg: '#E6F2EF', text: '#1A6B5A', label: 'Confirmed' };
      case 'pending':
        return { bg: '#FDF0EA', text: '#D4704A', label: 'Pending' };
      case 'cancelled':
        return { bg: '#FBEBEB', text: '#D32F2F', label: 'Cancelled' };
      default:
        return { bg: '#F0EDE8', text: '#6B7370', label: status };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#1A6B5A', '#D4704A', '#D69E2E'];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleCopyReference = async (refStr: string) => {
    await Clipboard.setStringAsync(refStr);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied!', 'Booking reference copied to clipboard.');
    }
  };

  const handleMessageGuest = async (bookingId: string, guestName: string, propertyName: string) => {
    try {
      const conv = await apiGet<any>(`/conversations/by-booking/${bookingId}?role=host`);
      if (conv && conv.id) {
        navigation.navigate('ChatDetail', {
          conversationId: conv.id,
          otherPartyName: guestName,
          propertyName: propertyName,
        });
      } else {
        Alert.alert('Error', 'Could not retrieve conversation.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not open message thread.');
    }
  };

  const handleViewDetails = (bookingId: string) => {
    navigation.navigate('HostBookingDetail', { bookingId });
  };

  const handleAddNew = () => {
    navigation.navigate('HostList1');
  };

  const formatDateRange = (inStr: string, outStr: string) => {
    try {
      const d1 = new Date(inStr);
      const d2 = new Date(outStr);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `${d1.toLocaleDateString('en-US', options)} – ${d2.toLocaleDateString('en-US', options)}`;
    } catch (e) {
      return `${inStr} – ${outStr}`;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']}
              style={StyleSheet.absoluteFillObject}
            >
              <View style={styles.headerTopRow}>
                {navigation.canGoBack() ? (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <Feather name="arrow-left" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 40 }} />
                )}
                
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Bookings</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>Manage and track all your bookings</Text>
                </View>

                <TouchableOpacity 
                  style={styles.bellButton} 
                  onPress={() => Alert.alert('Notifications', `You have ${unreadCount} unread messages.`)} 
                  activeOpacity={0.7}
                >
                  <Feather name="bell" size={20} color="#FFFFFF" />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, idx) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => handleTabPress(idx, tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Swipeable Tab Content */}
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (idx >= 0 && idx < tabs.length) {
              setActiveTab(tabs[idx].key);
            }
          }}
          style={{ flex: 1 }}
        >
          {tabs.map((tab) => {
            const tabBookings = bookings.filter((b) => {
              if (tab.key === 'all') return true;
              if (tab.key === 'upcoming') {
                return (
                  ['pending', 'confirmed'].includes(b.status.toLowerCase()) &&
                  new Date(b.check_in) >= new Date(new Date().setHours(0, 0, 0, 0))
                );
              }
              if (tab.key === 'completed') return b.status.toLowerCase() === 'completed';
              if (tab.key === 'cancelled') return b.status.toLowerCase() === 'cancelled';
              return true;
            });

            return (
              <View key={tab.key} style={{ width: SCREEN_WIDTH, flex: 1 }}>
                {loading ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1A6B5A" />
                  </View>
                ) : tabBookings.length === 0 ? (
                  <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                    refreshControl={
                      <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#1A6B5A" />
                    }
                  >
                    <View style={styles.centerContainer}>
                      <Feather name="calendar" size={48} color="#6B7370" />
                      <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                  </ScrollView>
                ) : (
                  <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#1A6B5A" />
                    }
                  >
                    {tabBookings.map((booking) => {
                      const guestName = booking.guest?.name ?? 'Guest';
                      const propertyName = booking.property?.name ?? 'Property';
                      const badge = getStatusStyle(booking.status);
                      const initials = getInitials(guestName);
                      const avatarBg = getAvatarColor(guestName);
                      const shortId = booking.id.substring(0, 6).toUpperCase();
                      const refString = `JUX-2026-${shortId}`;
                      
                      // Fallback notes from amenities if special_requests is empty
                      const notes = booking.special_requests || (booking.property?.location?.address ? `📍 Near ${booking.property.location.address}` : '🍽 Welcome breakfast included');

                      return (
                        <View key={booking.id} style={styles.card}>
                          {/* Top row */}
                          <View style={styles.cardHeader}>
                            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                              <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <View style={styles.headerDetails}>
                              <Text style={styles.guestName}>{guestName}</Text>
                              <View style={styles.guestsRow}>
                                <Feather name="user" size={12} color="#6B7370" />
                                <Text style={styles.guestsCount}> {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</Text>
                              </View>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: badge.bg, flexDirection: 'row', alignItems: 'center' }]}>
                              {badge.label.toLowerCase() === 'confirmed' || badge.label.toLowerCase() === 'completed' ? (
                                <Feather name="check-circle" size={11} color={badge.text} style={{ marginRight: 4 }} />
                              ) : badge.label.toLowerCase() === 'pending' ? (
                                <Feather name="clock" size={11} color={badge.text} style={{ marginRight: 4 }} />
                              ) : badge.label.toLowerCase() === 'cancelled' ? (
                                <Feather name="alert-circle" size={11} color={badge.text} style={{ marginRight: 4 }} />
                              ) : null}
                              <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                                {badge.label}
                              </Text>
                            </View>
                          </View>

                          {/* Property Name */}
                          <View style={styles.propertyDetails}>
                            <Text style={styles.propertyName}>{propertyName}</Text>
                            <View style={styles.dateRow}>
                              <Feather name="calendar" size={14} color="#6B7370" style={{ marginRight: 6 }} />
                              <Text style={styles.bookingDates}>{formatDateRange(booking.check_in, booking.check_out)}</Text>
                            </View>
                          </View>

                          {/* Booking Reference Box */}
                          <View style={styles.refBox}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
                              <Text style={styles.refValue}>REF: {refString}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.copyBtn} 
                              onPress={() => handleCopyReference(refString)}
                              activeOpacity={0.7}
                            >
                              <Feather name="copy" size={16} color="#1A6B5A" />
                            </TouchableOpacity>
                          </View>

                          {/* Guest notes */}
                          {!!notes && (
                            <View style={styles.specialRequestRow}>
                              <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#D4704A" style={{ marginRight: 8 }} />
                              <Text style={styles.specialRequestText}>
                                {notes}
                              </Text>
                            </View>
                          )}

                          {/* Bottom row */}
                          <View style={styles.cardFooter}>
                            <TouchableOpacity
                              style={styles.messageIconBtn}
                              onPress={() => handleMessageGuest(booking.id, guestName, propertyName)}
                              activeOpacity={0.7}
                            >
                              <Feather name="message-circle" size={20} color="#1A6B5A" />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.detailsBtn}
                              onPress={() => handleViewDetails(booking.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.detailsBtnText}>View Details</Text>
                            </TouchableOpacity>
                            <Text style={styles.amountText} numberOfLines={1}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
