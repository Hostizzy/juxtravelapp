import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { auth } from '../../../services/firebase';
import { useAuthStore } from '../../../stores/authStore';
import i18n from '../../../locales/i18n';
import styles from './SplashScreen.styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const DOT_INDICES = [0, 1, 2] as const;

export default function SplashScreen({ navigation }: Props) {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    console.log('Checking auth state...');
    const timer = setTimeout(async () => {
      try {
        let unsubscribe: () => void;
        unsubscribe = auth.onAuthStateChanged(
          async (firebaseUser) => {
            console.log('Firebase user:', firebaseUser?.uid);
            if (unsubscribe) {
              unsubscribe();
            }
            if (firebaseUser) {
              const name = await 
                AsyncStorage.getItem(
                  'user_full_name'
                ) ?? 'Traveller';
              
              useAuthStore.getState().setUser({
                uid: firebaseUser.uid,
                phoneNumber: 
                  firebaseUser.phoneNumber ?? '',
                name,
              });
              navigation.replace('Guest');
            } else {
              navigation.replace('Auth');
            }
          }
        );
      } catch (error) {
        navigation.replace('Auth');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <MaterialCommunityIcons name="leaf" size={64} color="#1A6B5A" />
        <Text style={styles.title}>JuxTravel</Text>
        <Text style={styles.tagline}>
          {i18n.t('auth.splash.tagline')}
        </Text>
      </View>
      <View style={styles.dots}>
        {DOT_INDICES.map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeDot === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

