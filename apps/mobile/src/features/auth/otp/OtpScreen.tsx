import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { verifyOTP } from '../../../services/phoneAuth';
import { saveUserToFirestore } from '../../../services/userService';
import { useAuthStore } from '../../../stores/authStore';
import i18n from '../../../locales/i18n';
import styles from './OtpScreen.styles';

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

type OtpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Otp'>;
  route: OtpScreenRouteProp;
};

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { sessionInfo, phoneNumber, fullName } = route.params || { sessionInfo: '', phoneNumber: '9876543210', fullName: 'Traveler' };
  
  // Format phone number for subtitle (e.g. +91 XXXXXX1234)
  const formattedPhone = phoneNumber.length >= 4 
    ? `+91 XXXXXX${phoneNumber.slice(-4)}`
    : `+91 ${phoneNumber}`;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

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
    // Only accept numeric digits
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanedText.slice(-1); // only keep last character
    setOtp(newOtp);

    // Auto-advance
    if (cleanedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current is empty, clear previous and focus previous
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

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setActiveInput(0);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP code.');
      return;
    }
    if (!sessionInfo) {
      Alert.alert('Error', 'Missing verification session. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await verifyOTP(sessionInfo, otpCode);
      if (result.success && result.user) {
        interface VerifyOtpUser {
          phoneNumber: string;
          uid: string;
        }
        const verifiedUser = result.user as VerifyOtpUser;
        const name = fullName || 'Traveler';
        await AsyncStorage.setItem('user_full_name', name);
        
        // Update auth store
        useAuthStore.getState().setUser({
          uid: verifiedUser.uid,
          phoneNumber: phoneNumber,
          name: name,
        });

        // Navigate immediately
        navigation.replace('Guest');

        // Save to Firestore in background (no await)
        saveUserToFirestore({
          uid: verifiedUser.uid,
          name,
          phoneNumber: '+91' + phoneNumber,
          role: 'guest',
        }).catch((err: unknown) => {
          console.error('Failed to save user to Firestore in background:', err);
        });
      } else {
        const errMsg = result.error || 'Invalid verification code entered.';
        setError(errMsg);
        Alert.alert('Verification Failed', errMsg);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
      Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.brandTitle}>{i18n.t('auth.otp.title')}</Text>
              <Text style={styles.tagline}>
                {i18n.t('auth.otp.subtitle')} {formattedPhone}
              </Text>
            </View>
          </View>

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
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity 
              style={[styles.verifyButton, loading && styles.buttonDisabled]} 
              onPress={handleVerify}
              activeOpacity={0.9}
              disabled={loading}
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
  );
}
