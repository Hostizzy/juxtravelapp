import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import i18n from '../../../locales/i18n';
import styles from './HostBookingsScreen.styles';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface BookingItem {
  id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  service_fee: number;
  host_payout: number;
  status: string;
  created_at: string;
  special_requests?: string;
  guest: {
    id: string;
    name: string;
  } | null;
  property: {
    id: string;
    name: string;
    location: any;
  } | null;
}

export default function HostBookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;

      const data = await apiService.get<BookingItem[]>('/bookings/host-bookings', token);
      setBookings(data ?? []);

      // Fetch unread messages count
      const conversations = await apiService.get<{ unreadCount: number }[]>(
        '/conversations?role=host',
        token
      );
      const total = (conversations ?? []).reduce(
        (sum, c) => sum + (c.unreadCount ?? 0),
        0
      );
      setUnreadCount(total);
    } catch (err) {
      console.error('Failed to fetch host bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchBookings();
    }
  }, [isFocused]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: i18n.t('host.bookings.tabAll') || 'All' },
    { key: 'upcoming', label: i18n.t('host.bookings.tabUpcoming') || 'Upcoming' },
    { key: 'completed', label: i18n.t('host.bookings.tabCompleted') || 'Completed' },
    { key: 'cancelled', label: i18n.t('host.bookings.tabCancelled') || 'Cancelled' },
  ];

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
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const conv = await apiService.get<any>(`/conversations/by-booking/${bookingId}?role=host`, token);
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
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarTitle}>Bookings</Text>
            <Text style={styles.topBarSubtitle}>Manage and track all your bookings</Text>
          </View>
          <TouchableOpacity 
            style={styles.bellButton} 
            onPress={() => Alert.alert('Notifications', `You have ${unreadCount} unread messages.`)} 
            activeOpacity={0.7}
          >
            <Feather name="bell" size={22} color="#1A1F1E" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scrollable Booking List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A6B5A" />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather name="calendar" size={48} color="#6B7370" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredBookings.map((booking) => {
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
                    <View style={styles.footerLeft}>
                      <TouchableOpacity
                        style={styles.messageBtn}
                        onPress={() => handleMessageGuest(booking.id, guestName, propertyName)}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="whatsapp" size={16} color="#1A6B5A" style={{ marginRight: 4 }} />
                        <Text style={styles.messageBtnText}>WhatsApp Guest</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => handleViewDetails(booking.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.amountText}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Plus FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddNew} activeOpacity={0.8}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
