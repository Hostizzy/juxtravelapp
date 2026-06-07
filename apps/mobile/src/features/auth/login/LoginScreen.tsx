import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import i18n from '../../../locales/i18n';
import styles from './LoginScreen.styles';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!fullName || fullName.trim().length < 2) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      Alert.alert('Error', 'Enter valid phone number');
      return;
    }
    
    setLoading(true);
    try {
      const cleanPhone = '+91' + phoneNumber.trim();
      const cleanName = fullName.trim();
      
      await apiService.post(
        '/auth/send-otp',
        { phone: cleanPhone }
      );
      
      navigation.navigate('Otp', {
        phone: cleanPhone,
        name: cleanName,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert(
      'Google Sign-In',
      'Google Login is not supported in this version. Please use Phone/OTP login.'
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
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
    </View>
  );
}
