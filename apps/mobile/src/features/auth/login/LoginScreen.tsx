import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useGoogleAuth } from '../../../services/googleAuth';
import { sendOTP } from '../../../services/phoneAuth';
import i18n from '../../../locales/i18n';
import styles from './LoginScreen.styles';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  
  const { signInWithGoogle } = useGoogleAuth();

  const handleSendOtp = async () => {
    if (!fullName || fullName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name.');
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const cleanPhone = phoneNumber.trim();
      const cleanName = fullName.trim();
      const result = await sendOTP(cleanPhone);
      
      if (result.success && result.sessionInfo) {
        navigation.navigate('Otp', {
          sessionInfo: result.sessionInfo,
          phoneNumber: cleanPhone,
          fullName: cleanName
        });
      } else {
        const errMsg = result.error || 'Failed to send verification code.';
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

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      if (result.user.displayName) {
        await AsyncStorage.setItem('user_full_name', result.user.displayName);
      } else {
        await AsyncStorage.setItem('user_full_name', 'Traveler');
      }
      navigation.replace('Guest');
    } else {
      console.error('Google Sign-In Error:', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Top Dark Header Section */}
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>{i18n.t('auth.login.title')}</Text>
              <View style={styles.underline} />
            </View>
            <Text style={styles.tagline}>{i18n.t('auth.login.tagline')}</Text>
          </View>

          {/* Content Area with overlapping elements */}
          <View style={styles.contentArea}>
            
            {/* Continue with Google Card */}
            <TouchableOpacity style={styles.googleCard} onPress={handleGoogleLogin} activeOpacity={0.8}>
              <View style={styles.googleIconBox}>
                <View style={styles.googleInnerSquare} />
              </View>
              <Text style={styles.googleCardText}>{i18n.t('auth.login.googleBtn')}</Text>
            </TouchableOpacity>

            {/* Phone Number Input Card */}
            <View style={styles.phoneCard}>
              
              {/* Full Name Section */}
              {/* <View style={styles.phoneHeaderRow}>
                <View style={styles.phoneIconBox}>
                  <Text style={styles.phoneIcon}>👤</Text>
                </View>
                <View style={styles.phoneHeaderTextContainer}>
                  <Text style={styles.phoneCardTitle}>{i18n.t('auth.login.nameLabel')}</Text>
                </View>
              </View> */}

              {/* Styled Full Name Input Field */}
              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={i18n.t('auth.login.namePlaceholder')}
                  placeholderTextColor="#A0A5A3"
                  value={fullName}
                  onChangeText={setFullName}
                  maxLength={40}
                />
              </View>

              {/* Phone Header Row */}
              {/* <View style={styles.phoneHeaderRow}>
                <View style={styles.phoneIconBox}>
                  <Text style={styles.phoneIcon}>📱</Text>
                </View>
                <View style={styles.phoneHeaderTextContainer}>
                  <Text style={styles.phoneCardTitle}>{i18n.t('auth.login.phoneLabel')}</Text>
                  <Text style={styles.phoneCardSubtitle}>{i18n.t('auth.login.phoneSubtitle')}</Text>
                </View>
              </View> */}

              {/* Styled Phone Input Field */}
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCodeText}>+91</Text>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={styles.textInput}
                  placeholder={i18n.t('auth.login.phonePlaceholder')}
                  placeholderTextColor="#A0A5A3"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                />
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity 
                style={[styles.sendOtpButton, loading && styles.buttonDisabled]} 
                onPress={handleSendOtp} 
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sendOtpButtonText}>{i18n.t('auth.login.sendOtp')}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* New Here Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{i18n.t('auth.login.newHere')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.compassCircle}>
                <Feather name="compass" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.infoCardText}>
                {i18n.locale === 'hi' ? (
                  <>
                    <Text style={styles.boldSage}>50k+ यात्रियों</Text> से जुड़ें जो AI का उपयोग करके बेहतरीन भारतीय यात्राएं बनाते हैं।
                  </>
                ) : (
                  <>
                    Join <Text style={styles.boldSage}>50k+ travelers</Text> using AI to curate bespoke Indian escapes.
                  </>
                )}
              </Text>
            </View>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {i18n.t('auth.login.terms')}{' '}
                <Text style={styles.termsLink}>{i18n.t('auth.login.termsLink')}</Text>{' '}
                {i18n.locale === 'hi' ? 'और' : 'and'}{' '}
                <Text style={styles.termsLink}>{i18n.t('auth.login.privacyLink')}</Text>.
              </Text>
              <View style={styles.bottomBarIndicator} />
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
