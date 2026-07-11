import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../hooks/useAuth';
import { AnimatedLogo } from '../../../components/Logo';
import { useI18n } from '../../../locales';

export const SplashScreen: React.FC<any> = ({ navigation }: any) => {
  const { getUser } = useAuth();
  const { t } = useI18n();

  const handleAnimationComplete = async () => {
    // Animation done, now check if user is logged in
    try {
      const user = await getUser();
      if (user) {
        // Auto-login successful, navigate to home based on role
        const route = user.role === 'host' ? 'HostApp' : 'Guest';
        navigation.replace(route);
      } else {
        // No user, go to login
        navigation.replace('Auth');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      navigation.replace('Auth');
    }
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#05201B', // Deep emerald
    },
    container: {
      flex: 1,
      backgroundColor: '#05201B',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      gap: 32,
    },
    loadingContainer: {
      marginTop: 48,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <AnimatedLogo
              size="large"
              color="white"
              onAnimationComplete={handleAnimationComplete}
              duration={1500}
            />
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color="#6FCF97"
                animating={true}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;
