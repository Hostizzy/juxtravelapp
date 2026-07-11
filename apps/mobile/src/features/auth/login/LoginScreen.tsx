import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../../components/Logo';
import { useI18n } from '../../../locales';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';

export const LoginScreen: React.FC<any> = ({ navigation }: any) => {
  const { sendOtp } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!name || name.trim().length === 0) {
      setError(t('auth.invalid_name') || 'Please enter your name');
      return;
    }
    if (!phone || phone.length < 10) {
      setError(t('auth.invalid_phone'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = '+91' + phone.trim();
      await sendOtp(fullPhone);
      navigation.navigate('Otp', { phone: fullPhone, name: name.trim() });
    } catch (err: any) {
      setError(err.message || t('auth.otp_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log('Google login not implemented yet');
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    heroSection: {
      height: 320,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderBottomLeftRadius: 48,
      borderBottomRightRadius: 48,
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    logoContainer: {
      zIndex: 1,
      alignItems: 'center',
    },
    heading: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 36,
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    scrollView: {
      flexGrow: 1,
    },
    safeArea: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 32,
    },
    cardContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    googleButton: {
      flexDirection: 'row',
      height: 52,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E2D9',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    googleIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: '#1A1F1E',
      justifyContent: 'center',
      alignItems: 'center',
    },
    googleButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1A1F1E',
    },
    googleIcon: {
      fontSize: 20,
    },
    inputGroup: {
      borderWidth: 1,
      borderColor: '#E8E2D9',
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      backgroundColor: '#F8F7F4',
      justifyContent: 'center',
    },
    input: {
      fontSize: 14,
      color: '#1A1F1E',
      paddingVertical: 0,
      fontFamily: 'DM Sans',
    },
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: '#E8E2D9',
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      backgroundColor: '#F8F7F4',
    },
    countryCode: {
      fontSize: 14,
      color: '#1A1F1E',
      fontWeight: '600',
      minWidth: 35,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: '#E8E2D9',
    },
    phoneInput: {
      flex: 1,
      fontSize: 14,
      color: '#1A1F1E',
      paddingVertical: 0,
      fontFamily: 'DM Sans',
    },
    ctaButton: {
      height: 52,
      borderRadius: 12,
      backgroundColor: '#6FB89D',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    ctaButtonDisabled: {
      backgroundColor: '#C4E5DD',
    },
    ctaText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    errorText: {
      fontSize: 12,
      color: '#D4704A',
      marginTop: 8,
      fontFamily: 'DM Sans',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E8E2D9',
    },
    dividerText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#8C9491',
      letterSpacing: 1,
    },
    newHereContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: '#E8F5F1',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    compassCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#0B5D4B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    newHereText: {
      fontSize: 13,
      color: '#1A1F1E',
      lineHeight: 18,
      flex: 1,
      fontFamily: 'DM Sans',
    },
    newHereBold: {
      fontWeight: '700',
      color: '#0B5D4B',
    },
  });

  return (
    <View style={styles.root}>
      {/* Hero Section - Bleeds behind status bar */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: HERO_IMAGE }}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
        </ImageBackground>
        <View style={styles.logoContainer}>
          <Logo size="large" color="white" />
          <Text style={styles.heading}>
            {t('auth.find_escape') || 'Plan your perfect trip'}
          </Text>
        </View>
      </View>

      {/* Form Section */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              {/* Form Card */}
              <View style={styles.cardContainer}>
                {/* Google Login Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.7}
                >
                  <View style={styles.googleIconContainer}>
                    <AntDesign name="google" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.name_placeholder') || 'Name'}
                    placeholderTextColor="#B8D4CE"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError('');
                    }}
                    editable={!loading}
                  />
                </View>

                {/* Phone Input */}
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder={t('auth.phone_placeholder') || 'Phone number'}
                    placeholderTextColor="#B8D4CE"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      setError('');
                    }}
                    editable={!loading}
                    maxLength={10}
                  />
                </View>

                {/* Error Message */}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    (loading || !name || !phone) && styles.ctaButtonDisabled,
                  ]}
                  onPress={handleSendOtp}
                  disabled={loading || !name || !phone}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.ctaText}>
                      {t('auth.send_otp') || 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* New Here Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>NEW HERE?</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* New Here Section */}
              <View style={styles.newHereContainer}>
                <View style={styles.compassCircle}>
                  <Feather name="compass" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.newHereText}>
                  Join <Text style={styles.newHereBold}>50k+ travelers</Text> using AI to curate bespoke Indian escapes.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
