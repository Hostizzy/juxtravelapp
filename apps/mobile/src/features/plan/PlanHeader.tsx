import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PlanHeaderProps {
  step: number;
  imageUri?: string;
  onBack: () => void;
  focalStyle?: any;
}

export default function PlanHeader({
  step,
  imageUri,
  onBack,
  focalStyle,
}: PlanHeaderProps) {
  return (
    <View style={styles.headerBackground} pointerEvents="box-none">
      {/* Curved Image & Gradient Blend Wrapper */}
      <View style={styles.topRightImageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.headerImage, focalStyle]}
            resizeMode="cover"
          />
        ) : null}
        <LinearGradient
          colors={['#0F1714', '#0F1714', 'rgba(15, 23, 20, 0.7)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Bottom fade of the header background */}
      <LinearGradient
        colors={['transparent', 'rgba(2, 20, 18, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerBottomFade}
      />

      {/* Dedicated Header Content Container */}
      <View style={styles.headerContent} pointerEvents="box-none">
        {/* Back Button Row */}
        <View style={styles.backButtonRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Step Label */}
        <Text style={styles.stepIndicator}>STEP {step} OF 4</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, step >= 1 && styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, step >= 2 && styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, step >= 3 && styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, step >= 4 && styles.progressSegmentFilled]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    backgroundColor: '#0F1714',
    height: 150, // Shared strict height
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // Clean flat bottom edges for questionnaire flow
  },
  topRightImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    width: '75%',
    height: '100%',
    opacity: 0.85,
  },
  headerBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Platform.OS === 'ios' ? 44 : 32, // Consistent status area margin offset
    paddingHorizontal: 24,
  },
  backButtonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    width: '60%',
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressSegmentFilled: {
    backgroundColor: '#1A6B5A',
    shadowColor: '#1A6B5A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
