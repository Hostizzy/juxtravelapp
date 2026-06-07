import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './HostOnboardingScreen.styles';

const { width } = Dimensions.get('window');

export default function HostOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSkip = () => {
    navigation.navigate('HostVerification');
  };

  const handleGetStarted = () => {
    navigation.navigate('HostVerification');
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  const handleDotPress = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Skip button */}
      <View style={styles.header}>
        {activeIndex < 2 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>{i18n.t('host.onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipeable Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {/* Slide 1 */}
        <View style={styles.slide}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="home-plus" size={56} color="#D4704A" />
          </View>
          <Text style={styles.title}>{i18n.t('host.onboarding.slide1Title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('host.onboarding.slide1Sub')}</Text>
        </View>

        {/* Slide 2 */}
        <View style={styles.slide}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="calendar-check" size={56} color="#D4704A" />
          </View>
          <Text style={styles.title}>{i18n.t('host.onboarding.slide2Title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('host.onboarding.slide2Sub')}</Text>
        </View>

        {/* Slide 3 */}
        <View style={styles.slide}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="currency-inr" size={56} color="#D4704A" />
          </View>
          <Text style={styles.title}>{i18n.t('host.onboarding.slide3Title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('host.onboarding.slide3Sub')}</Text>
        </View>
      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleDotPress(i)}
              style={[
                styles.dot,
                activeIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button (Slide 3 only) */}
        {activeIndex === 2 ? (
          <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{i18n.t('host.onboarding.getStarted')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      </SafeAreaView>
    </View>
  );
}
