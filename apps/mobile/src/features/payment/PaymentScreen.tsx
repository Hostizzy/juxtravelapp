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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { apiPost } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import RazorpayCheckout from 'react-native-razorpay';

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
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to book.');
        return;
      }

      // Step 1: Create booking first (pending status)
      const booking = await apiPost<{ id: string }>(
        '/bookings/create-direct',
        {
          propertyId,
          checkIn,
          checkOut,
          guests,
          totalAmount,
          status: 'pending', // pending until payment
        }
      );

      // Step 2: Create Razorpay order
      const order = await apiPost<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        isMock?: boolean;
      }>(
        '/payments/create-order',
        {
          amount: totalAmount,
          bookingId: booking.id,
          propertyName: propertyName,
        }
      );

      // If Razorpay keys are not configured, handle mock checkout/fallback flow
      if (order.isMock) {
        Alert.alert(
          'Demo Mode',
          'Razorpay keys not configured. Processing mock payment.'
        );
        navigation.navigate('BookingSuccess', {
          bookingId: booking.id,
          propertyName: propertyName,
          checkIn: checkIn,
          checkOut: checkOut,
        });
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        description: `Booking for ${propertyName}`,
        image: 'https://juxtravel.com/logo.png',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        order_id: order.orderId,
        name: 'JuxTravel',
        prefill: {
          name: user?.name ?? '',
          contact: user?.phone ?? '',
          email: user?.email ?? '',
        },
        theme: { color: '#1A6B5A' },
      };

      const data = await RazorpayCheckout.open(options);

      // Payment success (webhook will confirm booking)
      console.log('Payment success:', data);

      navigation.navigate('BookingSuccess', {
        bookingId: booking.id,
        propertyName: propertyName,
        checkIn: checkIn,
        checkOut: checkOut,
      });

    } catch (error: unknown) {
      const err = error as { code?: number; description?: string };
      
      if (err?.code === 2) {
        // User cancelled payment
        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment.'
        );
      } else {
        Alert.alert(
          'Payment Failed',
          err?.description ?? 
            'Payment failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Guest' }],
    });
  };

  if (success) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Feather name="check-circle" size={80} color="#1A6B5A" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your stay at {propertyName} has been successfully booked.
          </Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>STAY DETAILS</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dates</Text>
              <Text style={styles.summaryValue}>{checkIn} to {checkOut}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests</Text>
              <Text style={styles.summaryValue}>{guests} {guests === 1 ? 'Guest' : 'Guests'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid</Text>
              <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} activeOpacity={0.8}>
            <Text style={styles.homeButtonText}>Explore More Places</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

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
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Payment</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>SUMMARY</Text>
            <Text style={styles.propertyName}>{propertyName}</Text>
            <View style={styles.detailsRow}>
              <Feather name="calendar" size={14} color="#6B7370" />
              <Text style={styles.detailsText}>{checkIn} — {checkOut}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Feather name="users" size={14} color="#6B7370" />
              <Text style={styles.detailsText}>{guests} {guests === 1 ? 'guest' : 'guests'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={styles.sectionHeader}>CHOOSE PAYMENT METHOD</Text>

          {/* UPI */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardSelected]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={selectedMethod === 'upi' ? '#1A6B5A' : '#6B7370'} />
                <Text style={[styles.methodTitle, selectedMethod === 'upi' && styles.methodTitleActive]}>UPI Instant Pay</Text>
              </View>
              <View style={[styles.radio, selectedMethod === 'upi' && styles.radioActive]} />
            </View>
            {selectedMethod === 'upi' && (
              <View style={styles.methodDetails}>
                <Text style={styles.methodDetailsText}>Pay securely using Google Pay, PhonePe, or Paytm.</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Card */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardSelected]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                <Feather name="credit-card" size={20} color={selectedMethod === 'card' ? '#1A6B5A' : '#6B7370'} />
                <Text style={[styles.methodTitle, selectedMethod === 'card' && styles.methodTitleActive]}>Credit / Debit Card</Text>
              </View>
              <View style={[styles.radio, selectedMethod === 'card' && styles.radioActive]} />
            </View>
            {selectedMethod === 'card' && (
              <View style={styles.methodDetails}>
                <Text style={styles.methodDetailsText}>All major credit and debit cards (Visa, MasterCard, RuPay) are supported.</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Netbanking */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'netbanking' && styles.methodCardSelected]}
            onPress={() => setSelectedMethod('netbanking')}
            activeOpacity={0.8}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                <Feather name="globe" size={20} color={selectedMethod === 'netbanking' ? '#1A6B5A' : '#6B7370'} />
                <Text style={[styles.methodTitle, selectedMethod === 'netbanking' && styles.methodTitleActive]}>Net Banking</Text>
              </View>
              <View style={[styles.radio, selectedMethod === 'netbanking' && styles.radioActive]} />
            </View>
            {selectedMethod === 'netbanking' && (
              <View style={styles.methodDetails}>
                <Text style={styles.methodDetailsText}>Pay using direct bank transfer from your internet banking account.</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Payment Action */}
        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator size="small" color="#D4704A" style={styles.payLoader} />
          ) : (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment} activeOpacity={0.8}>
              <Text style={styles.payButtonText}>Pay ₹{totalAmount.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1714',
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
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2B25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#FAF8F4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexGrow: 1,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#6B7370',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 14,
    color: '#6B7370',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E2D9',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7370',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A6B5A',
  },
  sectionHeader: {
    fontSize: 10,
    color: '#6B7370',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontWeight: '700',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 16,
    marginBottom: 12,
  },
  methodCardSelected: {
    borderColor: '#1A6B5A',
    backgroundColor: '#FAFDFD',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7370',
  },
  methodTitleActive: {
    color: '#1A1F1E',
    fontWeight: '700',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E2D9',
  },
  radioActive: {
    borderColor: '#1A6B5A',
    backgroundColor: '#1A6B5A',
  },
  methodDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
  },
  methodDetailsText: {
    fontSize: 13,
    color: '#6B7370',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#0F1714',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E2522',
  },
  payButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  payLoader: {
    paddingVertical: 16,
  },
  /* Success screen styling */
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconWrapper: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#84C9BA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#1E2B25',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 36,
  },
  summaryTitle: {
    fontSize: 9,
    color: '#84C9BA',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
    marginBottom: 16,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#84C9BA',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
