import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useAuthStore, UserData } from '../../../stores/authStore';
import { apiService } from '../../../lib/api';
import i18n from '../../../locales/i18n';
import styles from './HostWelcomeScreen.styles';

export default function HostWelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);

  const handleBecomeHost = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      
      console.log('Token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        Alert.alert(
          'Error', 
          'Session expired. Please login again.'
        );
        return;
      }

      console.log('Calling become-host API...');
      
      const result = await apiService.post<UserData>(
        '/users/become-host',
        { bio: '' },
        token
      );

      console.log('Become host result:', result);

      useAuthStore.getState().setUser(result);

      navigation.replace('HostApp');

    } catch (error) {
      console.log('Become host error:', error);
      Alert.alert(
        'Error',
        'Failed to become host. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToGuest = () => {
    navigation.replace('Guest');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Top Brand Tagline */}
        <View style={styles.topBrand}>
          <MaterialCommunityIcons name="leaf" size={18} color="#84C9BA" />
          <Text style={styles.topBrandText}>{i18n.t('host.welcome.tagline')}</Text>
        </View>

        {/* Big Checkmark Circle */}
        <View style={styles.checkmarkCircle}>
          <Feather name="check" size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>{i18n.t('host.welcome.successTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.welcome.successSub')}</Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step1')}</Text>
          </View>

          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step2')}</Text>
          </View>

          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step3')}</Text>
          </View>
        </View>

        {/* Dashboard Button */}
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleBecomeHost} 
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting up...' : 'Go to Host Dashboard →'}
          </Text>
        </TouchableOpacity>

        {/* "I'll do this later" */}
        <TouchableOpacity onPress={handleGoToGuest} disabled={loading}>
          <Text style={styles.laterText}>{i18n.t('host.welcome.later')}</Text>
        </TouchableOpacity>

        {/* Footer info note */}
        <Text style={styles.footerNote}>{i18n.t('host.welcome.footerNote')}</Text>
      </View>
      </SafeAreaView>
    </View>
  );
}
