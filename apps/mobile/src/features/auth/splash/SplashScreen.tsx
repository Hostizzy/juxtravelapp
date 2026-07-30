import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../hooks/useAuth';

export const SplashScreen: React.FC<any> = ({ navigation }: any) => {
  const { getUser } = useAuth();
  
  // Animated values
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const dot1Scale = React.useRef(new Animated.Value(0)).current;
  const dot2Scale = React.useRef(new Animated.Value(0)).current;
  const dot3Scale = React.useRef(new Animated.Value(0)).current;

  const handleAnimationComplete = async () => {
    try {
      const user = await getUser();
      if (user) {
        const route = user.role === 'host' ? 'HostApp' : 'Guest';
        navigation.replace(route);
      } else {
        navigation.replace('Auth');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      navigation.replace('Auth');
    }
  };

  useEffect(() => {
    // Logo fade in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
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
      handleAnimationComplete();
    });
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        
        {/* Logo Centered */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity }]}>
            <Image
              source={require('../../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Dots at Bottom */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot1Scale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot2Scale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot3Scale }] },
            ]}
          />
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05201B',
  },
  container: {
    flex: 1,
    backgroundColor: '#05201B',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 220, // Bigger to zoom in
    height: 220,
    transform: [{ scale: 1.2 }], // Additional zoom
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 60, // Little above bottom
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6FCF97',
  },
});

export default SplashScreen;
