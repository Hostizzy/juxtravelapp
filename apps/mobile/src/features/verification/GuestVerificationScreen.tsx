import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';
import { pickImage, uploadVerificationDoc } from '../../services/propertyService';
import styles from './GuestVerificationScreen.styles';

type GuestVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'GuestVerification'
>;

type GuestVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GuestVerification'
>;

type Step = 1 | 2 | 3;
type IDType = 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License';

export default function GuestVerificationScreen() {
  const navigation = useNavigation<GuestVerificationScreenNavigationProp>();
  const route = useRoute<GuestVerificationScreenRouteProp>();
  const { user } = useAuthStore();

  const {
    propertyId,
    propertyName,
    checkIn,
    checkOut,
    guests,
    totalAmount,
  } = route.params;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [age, setAge] = useState('');
  const phone = user?.phone ?? '';

  const [idType, setIdType] = useState<IDType>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const handlePickIdPhoto = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setIdPhoto(uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick ID photo.');
    }
  };

  const handlePickSelfie = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setSelfie(uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick selfie.');
    }
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      Alert.alert('Validation Error', 'You must be between 18 and 99 years old.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!idNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your ID number.');
      return false;
    }
    if (!idPhoto) {
      Alert.alert('Validation Error', 'Please upload your ID Photo.');
      return false;
    }
    if (!selfie) {
      Alert.alert('Validation Error', 'Please upload a selfie with your ID.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else if (step === 2) {
      setStep(1);
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Authentication Error', 'Session expired. Please log in again.');
        return;
      }

      let idPhotoUrl = '';
      if (idPhoto) {
        const url = await uploadVerificationDoc(idPhoto, 'id-photo');
        if (url) {
          idPhotoUrl = url;
        } else {
          throw new Error('ID Photo upload failed');
        }
      }

      let selfieUrl = '';
      if (selfie) {
        const url = await uploadVerificationDoc(selfie, 'selfie');
        if (url) {
          selfieUrl = url;
        } else {
          throw new Error('Selfie upload failed');
        }
      }

      const res = await apiService.post<{ success: boolean; verificationId?: string; status: string }>(
        '/verification',
        {
          fullName,
          email,
          age: parseInt(age, 10),
          idType,
          idNumber,
          idPhotoUrl,
          selfieUrl,
          propertyId,
          checkIn,
          checkOut,
          guests,
          totalAmount,
        },
        token
      );

      navigation.navigate('Payment', {
        propertyId,
        propertyName,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        verificationId: res?.verificationId,
      });

    } catch (error) {
      console.error('Submit verification error:', error);
      Alert.alert('Error', 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => {
    return (
      <View style={styles.stepperContainer}>
        {/* Step 1 Circle */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepDotCircle,
            step >= 1 && styles.stepDotCircleActive
          ]}>
            <Text style={styles.stepDotNum}>1</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            step === 1 && styles.stepLabelActive,
            step > 1 && styles.stepLabelCompleted
          ]}>Personal Info</Text>
        </View>

        {/* Line 1 -> 2 */}
        <View style={[
          styles.stepperLine,
          step >= 2 && styles.stepperLineCompleted
        ]} />

        {/* Step 2 Circle */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepDotCircle,
            step >= 2 && styles.stepDotCircleActive
          ]}>
            <Text style={styles.stepDotNum}>2</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            step === 2 && styles.stepLabelActive,
            step > 2 && styles.stepLabelCompleted
          ]}>Documents</Text>
        </View>

        {/* Line 2 -> 3 */}
        <View style={[
          styles.stepperLine,
          step >= 3 && styles.stepperLineCompleted
        ]} />

        {/* Step 3 Circle */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepDotCircle,
            step >= 3 && styles.stepDotCircleActive
          ]}>
            <Text style={styles.stepDotNum}>3</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            step === 3 && styles.stepLabelActive
          ]}>Review</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.heroHeader}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.heroImage} 
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(15,23,20,0.4)', '#0F1714']}
          style={styles.gradientOverlay}
        />
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.circleBackBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Verify Your Identity</Text>
          <Text style={styles.heroSubtitle}>Required for trusted host bookings</Text>
        </View>

        {renderStepper()}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <View>
              <Text style={styles.sectionTitle}>Personal Info</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#1A6B5A" style={styles.leftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A0A5A3"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#1A6B5A" style={styles.leftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#A0A5A3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={styles.inputContainer}>
                  <Feather name="calendar" size={20} color="#1A6B5A" style={styles.leftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    placeholderTextColor="#A0A5A3"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputContainer, styles.textInputDisabled]}>
                  <Feather name="phone" size={20} color="#6B7370" style={styles.leftIcon} />
                  <TextInput
                    style={[styles.textInput, { color: '#6B7370' }]}
                    value={phone}
                    editable={false}
                    placeholder="Pre-filled from profile"
                    placeholderTextColor="#6B7370"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.continueButton} onPress={handleNext} activeOpacity={0.8}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: ID PROOF */}
          {step === 2 && (
            <View>
              <Text style={styles.sectionTitle}>Identity Proof</Text>

              <Text style={styles.inputLabel}>Select ID Type</Text>
              <View style={styles.selectorContainer}>
                {(['Aadhaar', 'PAN', 'Passport', 'Driving License'] as IDType[]).map((type) => {
                  const isActive = idType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.selectorOption, isActive && styles.selectorOptionActive]}
                      onPress={() => setIdType(type)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                        {isActive && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.selectorOptionText, isActive && styles.selectorOptionTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{idType} Number</Text>
                <View style={styles.inputContainer}>
                  <Feather name="file-text" size={20} color="#1A6B5A" style={styles.leftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={idNumber}
                    onChangeText={setIdNumber}
                    placeholder={`Enter your ${idType} number`}
                    placeholderTextColor="#A0A5A3"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Upload ID Photo</Text>
              <TouchableOpacity
                style={[styles.uploadBox, idPhoto !== null && styles.uploadBoxFilled]}
                onPress={handlePickIdPhoto}
                activeOpacity={0.8}
              >
                {idPhoto ? (
                  <Image source={{ uri: idPhoto }} style={styles.uploadImage} resizeMode="cover" />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Feather name="camera" size={32} color="#6B7370" />
                    <Text style={styles.uploadText}>Upload ID Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Upload Selfie with ID</Text>
              <TouchableOpacity
                style={[styles.uploadBox, selfie !== null && styles.uploadBoxFilled]}
                onPress={handlePickSelfie}
                activeOpacity={0.8}
              >
                {selfie ? (
                  <Image source={{ uri: selfie }} style={styles.uploadImage} resizeMode="cover" />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Feather name="camera" size={32} color="#6B7370" />
                    <Text style={styles.uploadText}>Upload Selfie with ID</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.continueButton} onPress={handleNext} activeOpacity={0.8}>
                <Text style={styles.continueButtonText}>Review details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <View>
              <Text style={styles.sectionTitle}>Review Your Details</Text>

              <View style={styles.verifyBadge}>
                <Feather name="shield" size={16} color="#1A6B5A" />
                <Text style={styles.verifyBadgeText}>Your data is secured with AES-256 encryption.</Text>
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Full Name</Text>
                  <Text style={styles.reviewValue}>{fullName}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Email</Text>
                  <Text style={styles.reviewValue}>{email}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Age</Text>
                  <Text style={styles.reviewValue}>{age}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Phone</Text>
                  <Text style={styles.reviewValue}>{phone}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>ID Type</Text>
                  <Text style={styles.reviewValue}>{idType}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>ID Number</Text>
                  <Text style={styles.reviewValue}>{idNumber}</Text>
                </View>
              </View>

              <View style={styles.previewRow}>
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>ID Photo</Text>
                  {idPhoto && (
                    <Image source={{ uri: idPhoto }} style={styles.previewThumbnail} resizeMode="cover" />
                  )}
                </View>
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Selfie with ID</Text>
                  {selfie && (
                    <Image source={{ uri: selfie }} style={styles.previewThumbnail} resizeMode="cover" />
                  )}
                </View>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#D4704A" style={{ marginVertical: 20 }} />
              ) : (
                <TouchableOpacity style={styles.continueButton} onPress={handleSubmit} activeOpacity={0.8}>
                  <Text style={styles.continueButtonText}>Confirm & Proceed to Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
