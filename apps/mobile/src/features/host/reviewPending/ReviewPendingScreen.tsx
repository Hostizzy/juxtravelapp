import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import styles from './ReviewPendingScreen.styles';

export default function ReviewPendingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HostReviewPending'>>();
  const { propertyId, propertyName, propertyPhoto, propertyType, propertyCity } = route.params;

  // Animation values
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.9)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle entry animations on mount
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoDashboard = () => {
    navigation.navigate('HostApp');
  };

  const handleEditProperty = () => {
    navigation.navigate('HostPropertyDetail', { propertyId });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <Animated.View style={[styles.heroHeader, { opacity: heroOpacity }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' }}
            style={styles.heroBgImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(11,93,75,0.3)', 'rgba(11,93,75,0.4)']}
            style={styles.gradientOverlay}
          />
          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons name="leaf" size={18} color="#FFFFFF" />
            <Text style={styles.logoText}>JuxTravel Host</Text>
          </View>
        </Animated.View>

        {/* Success Illustration (Overlaps the curve) */}
        <Animated.View style={[styles.celebrationWrapper, { transform: [{ scale: celebrationScale }] }]}>
          <View style={styles.celebrationCircle}>
            <MaterialCommunityIcons name="party-popper" size={44} color="#E67E52" />
            <View style={styles.badgeCircle}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        {/* Content Anim Container */}
        <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Property submitted!</Text>
            <Text style={styles.subtitle}>
              Our concierge team is reviewing your listing.{'\n'}
              Expect a status update within <Text style={styles.boldTime}>24–48 hours.</Text>
            </Text>
          </View>

          {/* Review Timeline Card */}
          <View style={styles.timelineCard}>
            {/* Steps Row */}
            <View style={styles.stepsWrapper}>
              {/* Lines behind steps */}
              <View style={[styles.stepLine, styles.stepLine1, styles.stepLine1Active]} />
              <View style={[styles.stepLine, styles.stepLine2]} />

              {/* Step 1: Submitted */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepCircleSubmitted]}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelSubmitted]}>Submitted</Text>
                <Text style={styles.stepSub}>Just now</Text>
              </View>

              {/* Step 2: In Review */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepCircleInReview]}>
                  <Feather name="clock" size={16} color="#E67E52" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelInReview]}>In Review</Text>
                <Text style={styles.stepSub}>Up next</Text>
              </View>

              {/* Step 3: Active */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepCircleActive]} />
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Active</Text>
                <Text style={styles.stepSub}>Coming soon</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Property Preview Card */}
            <View style={styles.previewWrapper}>
              {propertyPhoto ? (
                <Image source={{ uri: propertyPhoto }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={[styles.previewImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Feather name="image" size={24} color="#8E9A96" />
                </View>
              )}
              <View style={styles.previewContent}>
                <Text style={styles.previewName} numberOfLines={1}>{propertyName}</Text>
                <Text style={styles.previewDetailsText} numberOfLines={1}>
                  {propertyType} • {propertyCity}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={styles.reviewBadge}>
                    <Feather name="clock" size={12} color="#E67E52" />
                    <Text style={styles.reviewBadgeText}>Under Review</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* What Happens Next Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <Feather name="shield" size={20} color="#0B5D4B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoBody}>
                Our team will review your listing details, photos, amenities and pricing to ensure the best guest experience.
              </Text>
            </View>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGoDashboard} activeOpacity={0.8}>
            <Feather name="grid" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>

          {/* Secondary CTA */}
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleEditProperty} activeOpacity={0.8}>
            <Feather name="edit-2" size={18} color="#0B5D4B" />
            <Text style={styles.secondaryBtnText}>Edit Property</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
