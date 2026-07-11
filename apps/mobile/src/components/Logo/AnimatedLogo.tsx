import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

interface AnimatedLogoProps {
  size?: 'medium' | 'large';
  color?: 'dark' | 'white';
  containerStyle?: ViewStyle;
  onAnimationComplete?: () => void;
  autoStart?: boolean;
  duration?: number;
}

const SIZES = {
  medium: {
    fontSize: 36,
    dotSize: 8,
    gap: 3,
  },
  large: {
    fontSize: 48,
    dotSize: 10,
    gap: 4,
  },
};

const COLORS = {
  dark: {
    text: '#1A6B5A',
    dots: '#6FCF97',
  },
  white: {
    text: '#FFFFFF',
    dots: '#6FCF97',
  },
};

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'large',
  color = 'white',
  containerStyle,
  onAnimationComplete,
  autoStart = true,
  duration = 1500,
}) => {
  const sizeConfig = SIZES[size];
  const colorConfig = COLORS[color];

  // Animated values
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const dot1Scale = React.useRef(new Animated.Value(0)).current;
  const dot2Scale = React.useRef(new Animated.Value(0)).current;
  const dot3Scale = React.useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizeConfig.gap,
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: '700',
      color: colorConfig.text,
      fontFamily: 'DM Sans',
      letterSpacing: 1,
    },
    dotsContainer: {
      flexDirection: 'row',
      gap: sizeConfig.gap / 2,
      alignItems: 'center',
    },
    dot: {
      width: sizeConfig.dotSize,
      height: sizeConfig.dotSize,
      borderRadius: sizeConfig.dotSize / 2,
      backgroundColor: colorConfig.dots,
    },
  });

  const startAnimation = () => {
    // Text fade in
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: duration * 0.4,
      useNativeDriver: true,
    }).start();

    // Dots pop in sequence
    Animated.stagger(150, [
      Animated.timing(dot1Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(dot2Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(dot3Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: textOpacity,
          },
        ]}
      >
        JUXTRAVEL
      </Animated.Text>

      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ scale: dot1Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ scale: dot2Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ scale: dot3Scale }],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default AnimatedLogo;
