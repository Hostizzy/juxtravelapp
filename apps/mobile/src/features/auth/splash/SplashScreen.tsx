import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../../services/api';
import { useAuthStore, UserData } from '../../../stores/authStore';
import { queryClient } from '../../../lib/queryClient';
import styles from './SplashScreen.styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const checkAuth = async () => {
      // Wait for splash animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Get token from SecureStore
        const token = await SecureStore.getItemAsync('access_token');

        console.log(
          'Auto login - Token:',
          token ? 'Found' : 'Not found'
        );

        if (!token) {
          navigation.replace('Auth');
          return;
        }

        // Verify token with backend
        const userData = await apiService.get<UserData>(
          '/users/me',
          token
        );

        console.log(
          'Auto login - User:',
          userData?.name
        );

        // Save to store
        useAuthStore.getState().setUser({
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          role: userData.role as 'guest' | 'host' | 'both',
          avatar_url: userData.avatar_url,
          guest_profile: userData.guest_profile,
          host_profile: userData.host_profile,
        });

        // Navigate based on role
        navigation.replace('Guest');

      } catch (error) {
        console.log('Auto login failed:', error);
        
        // Clear expired token and query cache
        queryClient.clear();
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('user_id');
        useAuthStore.getState().clearAuth();
        
        navigation.replace('Auth');
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.icon}>🌿</Text>
        <Text style={styles.title}>JuxTravel</Text>
        <Text style={styles.tagline}>
          Travel like you know someone there
        </Text>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}
