import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, NativeSyntheticEvent, TextInputKeyPressEventData, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import { supabase } from '../../../services/supabase';
import { useAuthStore, UserData } from '../../../stores/authStore';
import { Session } from '@supabase/supabase-js';
import i18n from '../../../locales/i18n';
import styles from './OtpScreen.styles';
import { Feather as FeatherIcon } from '@expo/vector-icons';

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

type OtpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Otp'>;
  route: OtpScreenRouteProp;
};

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { phone, name } = route.params || { phone: '+919876543210', name: 'Traveler' };
  
  // Format phone number for subtitle (e.g. +91 XXXXXX1234)
  const formattedPhone = phone.length >= 4 
    ? `+91 XXXXXX${phone.slice(-4)}`
    : phone;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const otpValue = otp.join('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleTextChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanedText.slice(-1);
    setOtp(newOtp);

    if (cleanedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      setLoading(true);
      try {
        await apiService.post(
          '/auth/send-otp',
          { phone: phone }
        );
        setTimer(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setActiveInput(0);
      } catch (error) {
        Alert.alert('Error', 'Failed to resend OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP code.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    setLoading(true);
    try {
      console.log('Sending verify request:', {
        phone: phone,
        otp: otpValue,
        name: name,
      });

      const result = await apiService.post<{
        user: UserData;
        isNewUser: boolean;
        accessToken: string;
        userId: string;
      }>(
        '/auth/verify-otp',
        {
          phone: phone,
          otp: otpValue,
          name: name,
        }
      );

      console.log('Verify result:', result);

      // Navigate on success
      if (result && result.user && result.accessToken) {
        await SecureStore.setItemAsync(
          'access_token', 
          result.accessToken
        );
        await SecureStore.setItemAsync(
          'user_id',
          result.user.id
        );

        useAuthStore.getState().setUser(
          result.user
        );
        useAuthStore.getState().setSession({
          access_token: result.accessToken,
          user: result.user,
        } as unknown as Session);

        navigation.replace('Guest');
        return;
      }

      // Only show error if result is null
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );
    } catch (error) {
      console.log('Verify error:', error);
      Alert.alert(
        'Error',
        'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1714" translucent />
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            {/* Header Section with Background Image */}
            <ImageBackground
              source={require('../../../../assets/login_background.jpg')}
              style={styles.header}
              imageStyle={styles.headerImage}
              resizeMode="cover"
            >
              <View style={styles.headerOverlay}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <FeatherIcon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                  <Text style={styles.brandTitle}>{i18n.t('auth.otp.title')}</Text>
                  <Text style={styles.tagline}>
                    {i18n.t('auth.otp.subtitle')} {formattedPhone}
                  </Text>
                </View>
              </View>
            </ImageBackground>

            {/* Content Area */}
            <View style={styles.contentArea}>
              
              {/* OTP Input row */}
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => {
                      inputRefs.current[idx] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      (activeInput === idx || digit !== '') && styles.otpInputActive
                    ]}
                    value={digit}
                    onChangeText={(text) => handleTextChange(text, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    onFocus={() => handleFocus(idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isSubmitting}
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity 
                style={[
                  styles.verifyButton, 
                  (isSubmitting || otpValue.length !== 6) && styles.buttonDisabled
                ]} 
                onPress={handleVerify}
                activeOpacity={0.9}
                disabled={isSubmitting || otpValue.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>{i18n.t('auth.otp.verifyBtn')}</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendQuestion}>{i18n.t('auth.otp.resendText')}</Text>
                {timer > 0 ? (
                  <Text style={styles.resendTimer}>
                    {i18n.t('auth.otp.resendTimer', { seconds: timer })}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={styles.resendAction}>{i18n.t('auth.otp.resendBtn')}</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
