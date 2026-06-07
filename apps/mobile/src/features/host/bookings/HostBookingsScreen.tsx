import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './HostBookingsScreen.styles';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface BookingItem {
  id: string;
  name: string;
  guestsCount: number;
  status: 'Confirmed' | 'Action Required' | 'Completed' | 'Cancelled';
  property: string;
  dates: string;
  reference: string;
  specialRequest?: string;
  amount: string;
}

export default function HostBookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const bookings: BookingItem[] = [
    {
      id: '1',
      name: 'Priya M.',
      guestsCount: 3,
      status: 'Confirmed',
      property: 'Kerala Backwaters',
      dates: 'Oct 12-15',
      reference: 'REF: JUX-2026-001',
      specialRequest: 'Vegan breakfast preferred',
      amount: '₹24,500',
    },
    {
      id: '2',
      name: 'Arjun K.',
      guestsCount: 1,
      status: 'Confirmed',
      property: 'Hill Station Villa',
      dates: 'Nov 02-05',
      reference: 'REF: JUX-2026-002',
      amount: '₹18,200',
    },
    {
      id: '3',
      name: 'Sarah J.',
      guestsCount: 3,
      status: 'Action Required',
      property: 'Coastal Retreat',
      dates: 'Dec 20-24',
      reference: 'REF: JUX-2026-003',
      amount: '₹32,000',
    },
    {
      id: '4',
      name: 'Elena R.',
      guestsCount: 2,
      status: 'Completed',
      property: 'Urban Loft',
      dates: 'Sep 13-18',
      reference: 'REF: JUX-2026-004',
      amount: '₹15,750',
    },
  ];

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: i18n.t('host.bookings.tabAll') },
    { key: 'upcoming', label: i18n.t('host.bookings.tabUpcoming') },
    { key: 'completed', label: i18n.t('host.bookings.tabCompleted') },
    { key: 'cancelled', label: i18n.t('host.bookings.tabCancelled') },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.status === 'Confirmed' || b.status === 'Action Required';
    if (activeTab === 'completed') return b.status === 'Completed';
    if (activeTab === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return { bg: '#E6F2EF', text: '#1A6B5A' };
      case 'Action Required':
        return { bg: '#FDF0EA', text: '#D4704A' };
      case 'Completed':
        return { bg: '#F0EDE8', text: '#6B7370' };
      case 'Cancelled':
        return { bg: '#FBEBEB', text: '#D32F2F' };
      default:
        return { bg: '#F0EDE8', text: '#6B7370' };
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  const handleWhatsApp = (name: string) => {
    Alert.alert('WhatsApp Integration', `Opening chat with ${name} on WhatsApp...`);
  };

  const handleViewDetails = (booking: BookingItem) => {
    Alert.alert('Booking Details', `${booking.name} - ${booking.property}\nRef: ${booking.reference}`);
  };

  const handleAddNew = () => {
    navigation.navigate('HostList1');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>{i18n.t('host.bookings.title')}</Text>
          <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert('Notifications', 'No new notifications')} activeOpacity={0.7}>
            <Feather name="bell" size={22} color="#FFFFFF" />
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredBookings.map((booking) => {
            const badge = getStatusStyle(booking.status);
            return (
              <View key={booking.id} style={styles.card}>
                {/* Row 1 */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(booking.name)}</Text>
                  </View>
                  <View style={styles.headerDetails}>
                    <Text style={styles.guestName}>{booking.name}</Text>
                    <Text style={styles.guestsCount}>{booking.guestsCount} guests</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.propertyDetails}>
                  <Text style={styles.propertyName}>{booking.property}</Text>
                  <Text style={styles.bookingDates}>{booking.dates}</Text>
                </View>

                {/* Row 3: Reference */}
                <View style={styles.refBox}>
                  <Text style={styles.refLabel}>{i18n.t('host.bookings.bookingRef')}</Text>
                  <Text style={styles.refValue}>{booking.reference}</Text>
                </View>

                {/* Row 4: Special Request */}
                {!!booking.specialRequest && (
                  <View style={styles.specialRequestBox}>
                    <Text style={styles.specialRequestText}>
                      "{booking.specialRequest}"
                    </Text>
                  </View>
                )}

                {/* Row 5: Footer Actions */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <TouchableOpacity
                      style={styles.whatsappBtn}
                      onPress={() => handleWhatsApp(booking.name)}
                      activeOpacity={0.7}
                    >
                      <Feather name="message-circle" size={16} color="#1A6B5A" />
                      <Text style={styles.whatsappBtnText}>{i18n.t('host.bookings.whatsapp')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => handleViewDetails(booking)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailsBtnText}>{i18n.t('host.bookings.viewDetails')}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.amountText}>{booking.amount}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Floating Plus FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddNew} activeOpacity={0.8}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
