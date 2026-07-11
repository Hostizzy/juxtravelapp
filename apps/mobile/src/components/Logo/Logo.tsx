import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'dark' | 'white';
  containerStyle?: ViewStyle;
  showDots?: boolean;
}

const SIZES = {
  small: {
    fontSize: 20,
  },
  medium: {
    fontSize: 28,
  },
  large: {
    fontSize: 44,
  },
};

const COLORS = {
  dark: {
    text: '#1A6B5A',
  },
  white: {
    text: '#6FCF97',
  },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  color = 'white',
  containerStyle,
  showDots = false,
}) => {
  const sizeConfig = SIZES[size];
  const colorConfig = COLORS[color];

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: colorConfig.text,
      fontStyle: 'italic',
      letterSpacing: 0.3,
    },
    underline: {
      width: 60,
      height: 2,
      backgroundColor: colorConfig.text,
      marginTop: 4,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.text}>JuxTravel</Text>
      <View style={styles.underline} />
    </View>
  );
};

export default Logo;
