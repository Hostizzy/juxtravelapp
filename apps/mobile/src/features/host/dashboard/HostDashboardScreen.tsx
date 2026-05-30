import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import i18n from '../../../locales/i18n';
import styles from './HostDashboardScreen.styles';

interface StatItem {
  value: string;
  label: string;
}

interface PropertyItem {
  id: string;
  name: string;
  bookedCount: number;
  status: 'ACTIVE' | 'DRAFT';
}

interface BookingItem {
  id: string;
  name: string;
  property: string;
  dates: string;
  amount: string;
  status: 'CONFIRMED' | 'ACTION_REQ' | 'PENDING';
}

export default function HostDashboardScreen() {
  const stats: StatItem[] = [
    { value: '12', label: i18n.t('host.dashboard.allTime') },
    { value: '3', label: i18n.t('host.dashboard.checkins') },
    { value: '₹1.2L', label: i18n.t('host.dashboard.thisMonth') },
    { value: '4.8 ⭐', label: i18n.t('host.dashboard.avgRating') },
  ];

  const properties: PropertyItem[] = [
    { id: '1', name: 'Hillside Retreat', bookedCount: 4, status: 'ACTIVE' },
    { id: '2', name: 'Urban Sanctuary', bookedCount: 8, status: 'ACTIVE' },
  ];

  const bookings: BookingItem[] = [
    { id: '1', name: 'Aarav S.', property: 'Hillside Retreat', dates: 'Oct 12-15', amount: '₹12,400', status: 'CONFIRMED' },
    { id: '2', name: 'Mira K.', property: 'Urban Sanctuary', dates: 'Oct 20-22', amount: '₹8,200', status: 'ACTION_REQ' },
    { id: '3', name: 'Rohan J.', property: 'Hillside Retreat', dates: 'Oct 25-28', amount: '₹15,000', status: 'PENDING' },
  ];

  const getStatusColor = (status: 'CONFIRMED' | 'ACTION_REQ' | 'PENDING') => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#E6F2EF', text: '#2D8F5E' };
      case 'ACTION_REQ':
        return { bg: '#FDF0EA', text: '#D4704A' };
      case 'PENDING':
        return { bg: '#F0EDE8', text: '#6B7370' };
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'No new notifications');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>{i18n.t('host.dashboard.tagline')}</Text>
          <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.7}>
            <Feather name="bell" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STATS SECTION */}
          <View style={styles.statsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsScroll}
            >
              {stats.map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Text style={stat.value.includes('⭐') ? [styles.statValue, { fontSize: 20 }] : styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* MY PROPERTIES */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('host.dashboard.myProperties')}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionAction}>{i18n.t('host.dashboard.manage')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesScroll}
          >
            {properties.map((prop) => (
              <View key={prop.id} style={styles.propertyCard}>
                <View style={styles.propertyImagePlaceholder}>
                  <Feather name="home" size={32} color="#84C9BA" />
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: prop.status === 'ACTIVE' ? '#1A6B5A' : '#6B7370' },
                    ]}
                  >
                    <Text style={styles.statusChipText}>{prop.status}</Text>
                  </View>
                </View>
                <Text style={styles.propertyTitle}>{prop.name}</Text>
                <Text style={styles.propertyBooked}>{prop.bookedCount} Booked</Text>
              </View>
            ))}
          </ScrollView>

          {/* RECENT BOOKINGS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('host.dashboard.recentBookings')}</Text>
          </View>

          <View style={styles.bookingsList}>
            {bookings.map((booking) => {
              const colors = getStatusColor(booking.status);
              return (
                <View key={booking.id} style={styles.bookingRow}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: booking.status === 'CONFIRMED' ? '#1A6B5A' : '#D4704A' },
                    ]}
                  >
                    <Text style={styles.avatarText}>{getInitials(booking.name)}</Text>
                  </View>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingName}>{booking.name}</Text>
                    <Text style={styles.bookingSub}>
                      {booking.property} • {booking.dates}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={styles.bookingAmount}>{booking.amount}</Text>
                    <View style={[styles.rowStatusChip, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.rowStatusText, { color: colors.text }]}>
                        {booking.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* UPCOMING CHECK-INS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('host.dashboard.upcomingCheckins')}</Text>
          </View>

          <View style={styles.checkinsRow}>
            {/* Card 1 */}
            <View style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <Text style={styles.checkinTime}>Today 2PM</Text>
                <Feather name="calendar" size={16} color="#D4704A" />
              </View>
              <Text style={styles.checkinTitle}>Aarav S. • 2 Guests</Text>
            </View>

            {/* Card 2 */}
            <View style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <Text style={styles.checkinTime}>Tomorrow 11AM</Text>
                <Feather name="calendar" size={16} color="#D4704A" />
              </View>
              <Text style={styles.checkinTitle}>Janvi P. • 4 Guests</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
