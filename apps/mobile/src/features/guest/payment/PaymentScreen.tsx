import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiPost } from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';
import RazorpayCheckout from 'react-native-razorpay';
import { queryClient } from '../../../lib/queryClient';

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  
  const {
    propertyId,
    propertyName,
    checkIn,
    checkOut,
    guests,
    totalAmount,
  } = route.params;

  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const inFlightRef = React.useRef(false);
  const existingBookingIdRef = React.useRef<string | null>(null);

  const serviceFee = Math.round(totalAmount * 0.1);
  const subtotal = totalAmount - serviceFee;

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePayment = async () => {
    if (inFlightRef.current) return; // guard: block double-tap / duplicate retry
    inFlightRef.current = true;
    setLoading(true);

    let bookingId: string | null = existingBookingIdRef.current;

    try {
      if (!propertyId || !propertyName || !totalAmount) {
        throw new Error('Missing property details. Please try booking again.');
      }

      if (totalAmount <= 0) {
        throw new Error('Invalid amount. Please contact support.');
      }

      if (!user) {
        throw new Error('User not authenticated. Please login again.');
      }

      // Reuse existing pending booking on retry instead of creating a duplicate
      if (!bookingId) {
        const booking = await apiPost<{ id: string }>(
          '/bookings/create-direct',
          {
            propertyId,
            checkIn,
            checkOut,
            guests,
            totalAmount,
            status: 'pending',
          }
        );
        bookingId = booking.id;
        existingBookingIdRef.current = booking.id;
      }

      const order = await apiPost<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>(
        '/payments/create-order',
        {
          amount: totalAmount,
          bookingId,
          propertyName: propertyName,
        }
      );

      if (!order.orderId || !order.keyId) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      const options = {
        description: `Booking for ${propertyName}`,
        image: 'https://juxtravel.com/logo.png',
        currency: order.currency || 'INR',
        key: order.keyId,
        amount: order.amount,
        order_id: order.orderId,
        name: 'JuxTravel',
        prefill: {
          name: user.name || 'Guest',
          contact: user.phone || '',
          email: user.email || 'guest@juxtravel.com',
        },
        theme: { 
          color: '#1A6B5A' 
        },
        notes: {
          bookingId,
          propertyName: propertyName,
        },
      };

      const paymentData = await RazorpayCheckout.open(options);

      if (!paymentData.razorpay_payment_id) {
        throw new Error('Payment ID not received. Please contact support.');
      }

      // Verify signature server-side before treating as confirmed
      await apiPost('/payments/verify', {
        bookingId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });

      navigation.replace('BookingSuccess', {
        bookingId,
        propertyName: propertyName,
        checkIn: checkIn,
        checkOut: checkOut,
      });

    } catch (error: any) {
      if (error?.code === 0) {
        // Network error
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: handlePayment },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else if (error?.code === 2 || error?.description?.toLowerCase().includes('cancel')) {
        // User cancelled
        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment. Your booking is not confirmed.',
          [
            { text: 'Try Again', onPress: handlePayment },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else if (error?.code === 1) {
        // Server error
        Alert.alert(
          'Payment Failed',
          error?.description || 'Payment server error. Please try again.',
          [
            { text: 'Retry', onPress: handlePayment },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else if (error?.message?.includes('Missing') || error?.message?.includes('Invalid')) {
        // Validation error
        Alert.alert('Error', error.message, [{ text: 'OK' }]);
      } else {
        // Generic error
        Alert.alert(
          'Payment Failed',
          error?.description || error?.message || 'Something went wrong. Please try again.',
          [
            { text: 'Retry', onPress: handlePayment },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }

    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Complete Payment</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Property Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>PROPERTY DETAILS</Text>
            <Text style={styles.propertyName}>{propertyName}</Text>
            
            <View style={styles.detailsDivider} />

            <View style={styles.detailsRow}>
              <Feather name="calendar" size={16} color="#6B7370" />
              <Text style={styles.detailsText}>
                {formatDate(checkIn)} → {formatDate(checkOut)}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Feather name="users" size={16} color="#6B7370" />
              <Text style={styles.detailsText}>
                {guests} {guests === 1 ? 'Guest' : 'Guests'}
              </Text>
            </View>
          </View>

          {/* Price Breakdown Card */}
          <View style={styles.priceCard}>
            <Text style={styles.sectionLabel}>PRICE BREAKDOWN</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee (10%)</Text>
              <Text style={styles.priceValue}>₹{serviceFee.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Security Badges Row */}
          <View style={styles.securityRow}>
            <View style={styles.securityBadge}>
              <Text style={styles.securityText}>🔒 256-bit SSL Encrypted</Text>
            </View>
            <View style={styles.securityBadge}>
              <Text style={styles.securityText}>✓ Razorpay Secured</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Payment Action */}
        <View style={styles.footer}>
          {loading ? (
            <View style={styles.payButtonLoading}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment} activeOpacity={0.8}>
              <Text style={styles.payButtonText}>Pay ₹{totalAmount.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.termsText}>
            By proceeding you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: '#FAF8F4',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    marginBottom: 20,
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A6B5A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1F1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#FAF8F4',
    marginVertical: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#6B7370',
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    marginBottom: 20,
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7370',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#1A1F1E',
    fontWeight: '700',
  },
  priceDivider: {
    height: 1.5,
    backgroundColor: '#E8E2D9',
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1F1E',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A6B5A',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  securityBadge: {
    flex: 1,
    backgroundColor: '#F0EFEA',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  securityText: {
    fontSize: 11,
    color: '#6B7370',
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#FAF8F4',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    borderTopWidth: 1,
    borderColor: '#E8E2D9',
  },
  payButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonLoading: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    opacity: 0.8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7370',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  termsLink: {
    color: '#1A6B5A',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
