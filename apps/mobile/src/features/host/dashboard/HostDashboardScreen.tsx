import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useAuthStore } from '../../../stores/authStore';
import { useMyProperties } from '../../../hooks/useProperties';
import { useHostStats, useHostBookings } from '../../../hooks/useBookings';
import { useConversations } from '../../../hooks/useConversations';
import i18n from '../../../locales/i18n';
import styles from './HostDashboardScreen.styles';

export default function HostDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userName = user?.name ?? 'Host';

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }, [queryClient])
  );

  const { data: properties = [], isLoading: propsLoading } = useMyProperties();
  const { data: statsData } = useHostStats();
  const stats = statsData ?? { 
    allTimeBookings: 0, 
    checkInsThisMonth: 0, 
    earningsThisMonth: 0,
    earningsAllTime: 0,
  };
  const { data: allBookings = [] } = useHostBookings();
  const recentBookings = allBookings.slice(0, 3);
  const isInitialLoad = propsLoading;

  const { data: conversations = [] } = useConversations('host');
  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0
  );

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'completed':
        return { bg: '#E6F2EF', text: '#1A6B5A' };
      case 'pending':
        return { bg: '#FDF0EA', text: '#D4704A' };
      default:
        return { bg: '#F0EDE8', text: '#6B7370' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
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

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'No new notifications');
  };

  const handleViewAllBookings = () => {
    navigation.navigate('HostApp');
    (navigation as any).navigate('HostBookings');
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
      {/* Header Background Cover with dark tint */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
          style={styles.headerBgImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <SafeAreaView style={styles.headerContent} edges={['top']}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.welcomeText}>Good evening, {userName}</Text>
                <Text style={styles.logoTitle}>JuxTravel Host</Text>
              </View>
              <TouchableOpacity style={styles.bellButton} onPress={handleNotificationPress} activeOpacity={0.7}>
                <Feather name="bell" size={22} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Overlay Stat Cards on the header bottom */}
            {isInitialLoad && stats.earningsAllTime === 0 ? (
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.statsRow}>
                {/* Stat 1 */}
                <TouchableOpacity 
                  style={styles.statCard}
                  onPress={() => (navigation as any).navigate('HostProfile', { activeTab: 'STATS' })}
                  activeOpacity={0.7}
                >
                  <Feather name="calendar" size={16} color="#84C9BA" />
                  <Text style={styles.statValue}>{stats.allTimeBookings}</Text>
                  <Text style={styles.statLabel}>All time bookings</Text>
                </TouchableOpacity>
                {/* Stat 2 */}
                <TouchableOpacity 
                  style={styles.statCard}
                  onPress={() => (navigation as any).navigate('HostProfile', { activeTab: 'STATS' })}
                  activeOpacity={0.7}
                >
                  <Feather name="check-square" size={16} color="#84C9BA" />
                  <Text style={styles.statValue}>{stats.checkInsThisMonth}</Text>
                  <Text style={styles.statLabel}>Check-ins this month</Text>
                </TouchableOpacity>
                {/* Stat 3 */}
                <TouchableOpacity 
                  style={styles.statCard}
                  onPress={() => (navigation as any).navigate('HostProfile', { activeTab: 'STATS' })}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="currency-inr" size={16} color="#84C9BA" />
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        Alert.alert('Earnings Calculation', 'Earnings shown are after the platform service fee is deducted from the total booking amount paid by the guest.');
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather name="info" size={12} color="#84C9BA" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.statValue}>
                    {(stats.earningsAllTime ?? 0) >= 100000 
                      ? `₹${((stats.earningsAllTime ?? 0) / 100000).toFixed(1)}L` 
                      : `₹${((stats.earningsAllTime ?? 0) / 1000).toFixed(0)}k`}
                  </Text>
                  <View style={{ alignSelf: 'stretch' }}>
                    <Text style={styles.statLabel} numberOfLines={1}>Your total earnings</Text>
                    <Text style={{ fontSize: 8, color: '#84C9BA', marginTop: 1, fontFamily: 'monospace' }}>(after service fee)</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* MY PROPERTIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{i18n.t('host.dashboard.myProperties') || 'MY PROPERTIES'}</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('HostProfile')} activeOpacity={0.7}>
            <Text style={styles.sectionAction}>{i18n.t('host.dashboard.manage') || 'Manage'}</Text>
          </TouchableOpacity>
        </View>

        {isInitialLoad && properties.length === 0 ? (
          <ActivityIndicator 
            color="#1A6B5A" 
            size="small"
            style={{ marginVertical: 20 }}
          />
        ) : properties.length === 0 ? (
          <TouchableOpacity 
            style={styles.emptyPropertiesBox} 
            onPress={() => navigation.navigate('HostList1')}
            activeOpacity={0.8}
          >
            <View style={styles.emptyPropertiesIconCircle}>
              <MaterialCommunityIcons name="home-variant-outline" size={32} color="#1A6B5A" />
            </View>
            <Text style={styles.emptyPropertiesText}>No properties yet</Text>
            <Text style={styles.emptyPropertiesSub}>Tap + to list your first property</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesScroll}
          >
            {properties.map((property) => (
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
            ))}
          </ScrollView>
        )}

        {/* RECENT BOOKINGS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{i18n.t('host.dashboard.recentBookings') || 'RECENT BOOKINGS'}</Text>
          <TouchableOpacity onPress={handleViewAllBookings} activeOpacity={0.7}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {isInitialLoad && recentBookings.length === 0 ? (
          <ActivityIndicator color="#1A6B5A" size="small" style={{ marginVertical: 20 }} />
        ) : recentBookings.length === 0 ? (
          <View style={styles.emptyBookingsBox}>
            <Feather name="calendar" size={24} color="#6B7370" />
            <Text style={styles.emptyBookingsText}>No recent bookings</Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {recentBookings.map((booking) => {
              const guestName = booking.guest?.name ?? 'Guest';
              const propertyName = booking.property?.name ?? 'Property';
              const colors = getStatusColor(booking.status);
              const initials = getInitials(guestName);
              const avatarBg = getAvatarColor(guestName);
              
              return (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingRow}
                  onPress={() => navigation.navigate('HostBookingDetail', { bookingId: booking.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingName}>{guestName}</Text>
                    <Text style={styles.bookingSub} numberOfLines={1}>
                      {propertyName} • {formatDateRange(booking.check_in, booking.check_out)}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={styles.bookingAmount}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
                    <View style={[styles.rowStatusChip, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.rowStatusText, { color: colors.text }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
