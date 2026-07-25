import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import styles from './BookingDetailScreen.styles';

type BookingDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'BookingDetail'
>;

type BookingDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingDetail'
>;

interface BookingDetail {
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
  payment_id: string;
  created_at: string;
  property: {
    name: string;
    photos: string[];
    location: {
      address?: string;
      city: string;
      state: string;
    };
  };
  host?: {
    name: string;
    phone?: string;
  };
}

export default function BookingDetailScreen() {
  const navigation = useNavigation<BookingDetailScreenNavigationProp>();
  const route = useRoute<BookingDetailScreenRouteProp>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) return;

        const [bookingData, convData] = await Promise.all([
          apiService.get<BookingDetail>(`/bookings/${bookingId}`, token),
          apiService.get<any>(`/conversations/by-booking/${bookingId}`, token).catch(() => null)
        ]);

        setBooking(bookingData);
        setConversation(convData);
      } catch (err) {
        console.error('Fetch booking detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [bookingId]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const calculateNights = (inStr: string, outStr: string) => {
    try {
      const d1 = new Date(inStr);
      const d2 = new Date(outStr);
      const diff = d2.getTime() - d1.getTime();
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1;
    } catch (e) {
      return 1;
    }
  };

  const handleCallHost = (phone?: string) => {
    if (!phone) {
      Alert.alert('Error', 'Host phone number not available.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate call.');
    });
  };

  const handleTextHost = (phone?: string) => {
    if (!phone) {
      Alert.alert('Error', 'Host phone number not available.');
      return;
    }
    Linking.openURL(`sms:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate message.');
    });
  };

  const handleMessageHost = () => {
    if (!conversation?.id) {
      Alert.alert('Error', 'Conversation not found');
      return;
    }
    navigation.navigate('ChatDetail', {
      conversationId: conversation.id,
      otherPartyName: booking?.host?.name ?? 'Host',
      propertyName: booking?.property?.name ?? '',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A6B5A" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#D4704A" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>Booking details could not be loaded.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const nights = calculateNights(booking.check_in, booking.check_out);
  const statusLower = booking.status.toLowerCase();
  
  // Status Badge styles
  let statusText = 'PENDING';
  let statusBg = '#FFF4E5';
  let statusColor = '#F57C00';
  let statusIcon: 'clock' | 'check' | 'x' = 'clock';

  if (statusLower === 'confirmed') {
    statusText = '✓ CONFIRMED';
    statusBg = '#E6F2EF';
    statusColor = '#1A6B5A';
    statusIcon = 'check';
  } else if (statusLower === 'completed') {
    statusText = '✓ COMPLETED';
    statusBg = '#F0EDE8';
    statusColor = '#6B7370';
    statusIcon = 'check';
  } else if (statusLower === 'cancelled') {
    statusText = '✗ CANCELLED';
    statusBg = '#FCE8E6';
    statusColor = '#C62828';
    statusIcon = 'x';
  }

  const subtotal = booking.total_amount - booking.service_fee;

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Top Hero Header */}
        <View style={styles.headerWrapper}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800' }} 
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
            
            <Text style={styles.headerTitleText}>Booking Details</Text>
            
            <View style={{ width: 40 }} />
          </View>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {booking.property?.photos && booking.property.photos.length > 0 ? (
            <Image
              source={{ uri: booking.property.photos[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Feather name="home" size={48} color="#84C9BA" />
            </View>
          )}
        </View>

        {/* Status Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        {/* Property Title & Location */}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{booking.property?.name || 'Beautiful Stay'}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#6B7370" />
            <Text style={styles.locationText}>
              {booking.property?.location?.city || 'India'}, {booking.property?.location?.state || 'India'}
            </Text>
          </View>
        </View>

        {/* Trip Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Trip Overview</Text>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Check-in</Text>
            <Text style={styles.infoValue}>{formatDate(booking.check_in)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Check-out</Text>
            <Text style={styles.infoValue}>{formatDate(booking.check_out)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guests</Text>
            <Text style={styles.infoValue}>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nights</Text>
            <Text style={styles.infoValue}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
          </View>
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Payment Summary</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subtotal</Text>
            <Text style={styles.infoValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Fee</Text>
            <Text style={styles.infoValue}>₹{booking.service_fee.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Host Info Card */}
        {booking.host && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>Your Host</Text>
            <View style={styles.divider} />

            <View style={styles.hostRow}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>
                  {booking.host.name?.charAt(0).toUpperCase() || 'H'}
                </Text>
              </View>
              <View style={styles.hostMeta}>
                <Text style={styles.hostName}>{booking.host.name || 'Stay Host'}</Text>
                <Text style={styles.hostSub}>{booking.host.phone || 'Contact not listed'}</Text>
              </View>
              <View style={styles.hostActions}>
                <TouchableOpacity
                  style={styles.hostActionBtn}
                  onPress={() => handleCallHost(booking.host?.phone)}
                  activeOpacity={0.7}
                >
                  <Feather name="phone" size={16} color="#1A6B5A" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hostActionBtn}
                  onPress={handleMessageHost}
                  activeOpacity={0.7}
                >
                  <Feather name="message-square" size={16} color="#1A6B5A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Reference & Footer */}
        <View style={styles.footer}>
          <Text style={styles.referenceText}>Booking ID: {booking.id.toUpperCase()}</Text>
          <Text style={styles.referenceText}>Booked on: {formatDate(booking.created_at)}</Text>
        </View>
      </ScrollView>
      </View>
    </View>
  );
}
