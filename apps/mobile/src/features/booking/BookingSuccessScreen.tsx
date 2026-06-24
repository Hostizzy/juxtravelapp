import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './BookingSuccessScreen.styles';

type BookingSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  'BookingSuccess'
>;

type BookingSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingSuccess'
>;

export default function BookingSuccessScreen() {
  const navigation = useNavigation<BookingSuccessScreenNavigationProp>();
  const route = useRoute<BookingSuccessScreenRouteProp>();

  const { propertyName, checkIn, checkOut } = route.params;

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

  const handleViewTrips = () => {
    navigation.navigate('BookingDetail', {
      bookingId: route.params.bookingId,
    });
  };

  const handleBackToHome = () => {
    navigation.navigate('Guest', {
      screen: 'Home',
    } as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Top Hero Header */}
        <View style={styles.headerWrapper}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }} 
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
              onPress={handleBackToHome}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>Booking Success</Text>
            
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Animated/Beautiful Sage Green Checkmark Circle */}
          <View style={styles.successCircle}>
            <Feather name="check" size={60} color="#FFFFFF" />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Booking Confirmed! 🎉</Text>
          <Text style={styles.subtitle}>
            Your stay has been booked successfully. Prepare for an unforgettable experience!
          </Text>

          {/* Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{propertyName}</Text>
            
            <View style={styles.divider} />

            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>CHECK-IN</Text>
                <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
              </View>
              <View style={styles.dateArrow}>
                <Feather name="arrow-right" size={16} color="#6B7370" />
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>CHECK-OUT</Text>
                <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewTrips}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>View My Trips</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToHome}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
