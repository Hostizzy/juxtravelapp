import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './PlanProcessingScreen.styles';
import { getMatches } from '../../services/matchService';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../services/api';

type PlanProcessingProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanProcessing'>;
  route: RouteProp<RootStackParamList, 'PlanProcessing'>;
};

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function PlanProcessingScreen({ navigation, route }: PlanProcessingProps) {
  const { destination, checkIn, checkOut, guests, groupType, moods, budget, freeText, bedrooms } = route.params;
  const [activeStep, setActiveStep] = useState(0);

  // Hook declarations for animations (strictly top-level)
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loaderRotateAnim = useRef(new Animated.Value(0)).current;
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;

  // Animation controller (strictly top-level)
  useEffect(() => {
    // 1. Orbital Ring Rotation loop
    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    // 2. Pulse Glow loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Active Step Loader Spin loop
    const loaderRotateLoop = Animated.loop(
      Animated.timing(loaderRotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loaderRotateLoop.start();

    // 4. Slow floating particles animations
    const floatAnim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(particle1Y, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particle1Y, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(particle2Y, {
          toValue: -16,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particle2Y, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatAnim1.start();
    floatAnim2.start();

    return () => {
      orbitLoop.stop();
      pulseLoop.stop();
      loaderRotateLoop.stop();
      floatAnim1.stop();
      floatAnim2.stop();
    };
  }, [orbitAnim, pulseAnim, loaderRotateAnim, particle1Y, particle2Y]);

  // Steps progression & routing timers (strictly top-level)
  useEffect(() => {
    let isMounted = true;

    // Step animation (visual)
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => 
        prev < 4 ? prev + 1 : prev
      );
    }, 1200);

    // Real data fetching
    const fetchData = async () => {
      const startTime = Date.now();
      
      try {
        const token = await SecureStore.getItemAsync('access_token');
        
        const [matches, savedData] = await Promise.all([
          getMatches(
            destination,
            checkIn,
            checkOut,
            guests,
            bedrooms,
            groupType,
            moods,
            budget
          ),
          token
            ? apiService.get<{ id: string }[]>('/users/saved-properties', token).catch(() => [])
            : Promise.resolve([]),
        ]);

        // Ensure minimum 4.5 second display time for the animation
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 4500 - elapsed);

        setTimeout(() => {
          if (isMounted) {
            clearInterval(stepInterval);
            navigation.replace('MatchResults', {
              destination,
              checkIn,
              checkOut,
              guests,
              groupType,
              moods,
              budget,
              freeText,
              bedrooms,
              matches,
              savedIds: (savedData || []).map((p) => p.id),
            });
          }
        }, remaining);

      } catch (error) {
        console.error('Match fetch failed:', error);
        if (isMounted) {
          clearInterval(stepInterval);
          navigation.replace('MatchResults', {
            destination,
            checkIn,
            checkOut,
            guests,
            groupType,
            moods,
            budget,
            freeText,
            bedrooms,
            matches: [],
            savedIds: [],
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearInterval(stepInterval);
    };
  }, [navigation, destination, checkIn, checkOut, guests, groupType, moods, budget, freeText, bedrooms]);

  // Interpolations (evaluated at render time)
  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loaderRotation = loaderRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const stepsData = [
    {
      title: 'Analyzing travel preferences...',
      helper: 'Understanding your taste and style',
    },
    {
      title: `Scoring active properties in ${destination || 'Goa'}...`,
      helper: 'Evaluating top-rated stays',
    },
    {
      title: `Filtering by ${formatCurrency(budget)} budget...`,
      helper: 'Finding best value for your money',
    },
    {
      title: `Matching group fit for ${guests} guest${guests !== 1 ? 's' : ''}...`,
      helper: 'Ensuring the perfect experience',
    },
    {
      title: 'Polishing your personalized concierge matches...',
      helper: 'Adding final magic ✨',
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Concierge Search</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Hero Scanner Area */}
          <View style={styles.heroArea}>
            {/* Glow outer ring */}
            <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />

            {/* Orbit border ring */}
            <View style={styles.orbitRing} />

            {/* Orbit riding dot */}
            <Animated.View style={[styles.orbitContainer, { transform: [{ rotate: orbitRotation }] }]}>
              <View style={styles.orbitDot} />
            </Animated.View>

            {/* Center Canvas */}
            <View style={styles.centerCanvas}>
              {/* Cloud Decor */}
              <Feather name="cloud" size={16} color="#A0D1C5" style={styles.decorCloud} />
              
              {/* Palm Silhouettes */}
              <MaterialCommunityIcons name="palm-tree" size={54} color="#A7DED1" style={styles.decorPalm} />
              <MaterialCommunityIcons name="palm-tree" size={42} color="#A7DED1" style={styles.decorPalmRight} />

              {/* Suitcase Illustration */}
              <View style={styles.decorSuitcase}>
                <View style={styles.suitcaseHandle} />
                <View style={styles.suitcaseBody}>
                  <View style={styles.suitcaseStrapLeft} />
                  <View style={styles.suitcaseStrapRight} />
                  <View style={styles.suitcaseBadge}>
                    <Feather name="feather" size={10} color="#1B7A69" />
                  </View>
                </View>
                <View style={styles.suitcaseWheelsRow}>
                  <View style={styles.suitcaseWheel} />
                  <View style={styles.suitcaseWheel} />
                </View>
              </View>
            </View>

            {/* Floating particles */}
            <Animated.View style={[styles.floatingParticle, { top: 30, left: 16, transform: [{ translateY: particle1Y }] }]} />
            <Animated.View style={[styles.floatingParticle, { bottom: 40, right: 10, transform: [{ translateY: particle2Y }] }]} />
            <View style={[styles.floatingParticle, { top: 80, right: 30, width: 3, height: 3, opacity: 0.15 }]} />
            <View style={[styles.floatingParticle, { bottom: 80, left: 24, width: 4, height: 4, opacity: 0.2 }]} />
          </View>

          {/* Headline Block */}
          <View style={styles.titleBlock}>
            <Text style={styles.headline}>Generating Your Escape...</Text>
            <Text style={styles.subtitle}>AI Match Engine is curating your perfect matches</Text>
          </View>

          {/* Checklist Timeline Card */}
          <View style={styles.stepsCard}>
            {stepsData.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              const isLast = index === stepsData.length - 1;

              return (
                <View
                  key={index}
                  style={[styles.stepRow, isLast && styles.stepRowLast]}
                >
                  {/* Vertical lines connecting checklist items */}
                  {!isLast && (
                    <View
                      style={[
                        styles.verticalLine,
                        isCompleted && styles.verticalLineActive,
                      ]}
                    />
                  )}

                  {/* Icon checklist circle indicator */}
                  <View
                    style={[
                      styles.iconContainer,
                      isCompleted && styles.iconContainerCompleted,
                      isActive && styles.iconContainerActive,
                    ]}
                  >
                    {isCompleted && (
                      <Feather name="check" size={14} color="#1B7A69" />
                    )}
                    {isActive && (
                      <Animated.View style={{ transform: [{ rotate: loaderRotation }] }}>
                        <Feather name="loader" size={12} color="#D67A4A" />
                      </Animated.View>
                    )}
                    {!isCompleted && !isActive && (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#E6E8E5' }} />
                    )}
                  </View>

                  {/* Label texts */}
                  <View style={styles.stepDetails}>
                    <Text
                      style={[
                        styles.stepText,
                        isCompleted && styles.stepTextCompleted,
                        isActive && styles.stepTextActive,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.helperText,
                        isCompleted && styles.helperTextCompleted,
                        isActive && styles.helperTextActive,
                      ]}
                    >
                      {step.helper}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
