import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { pickImage } from '../../../services/propertyService';
import i18n from '../../../locales/i18n';
import styles from './ListStep1Screen.styles';
import { SelectModal } from '../../../components/SelectModal/SelectModal';
import { INDIAN_STATES, INDIAN_STATES_CITIES } from './data/indianStatesAndCities';

type PropertyType = string;

export default function ListStep1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // States
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);
  const [propertyName, setPropertyName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PropertyType>('Homestay');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [stateModalVisible, setStateModalVisible] = useState<boolean>(false);
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);

  const propertyTypes: { type: string; icon: string; iconType: 'feather' | 'mci'; iconMci?: string }[] = [
    { type: 'Homestay', icon: 'home', iconType: 'feather' },
    { type: 'Farmstay', icon: 'home', iconType: 'mci', iconMci: 'sprout' },
    { type: 'Villa', icon: 'home', iconType: 'mci', iconMci: 'office-building' },
    { type: 'Cottage', icon: 'home', iconType: 'mci', iconMci: 'home-variant' },
    { type: 'Eco-Lodge', icon: 'home', iconType: 'mci', iconMci: 'leaf' },
    { type: 'Boutique Hotel', icon: 'home', iconType: 'mci', iconMci: 'domain' },
    { type: 'Heritage Property', icon: 'home', iconType: 'mci', iconMci: 'castle' },
    { type: 'Houseboat', icon: 'home', iconType: 'mci', iconMci: 'sail-boat' },
    { type: 'Treehouse', icon: 'home', iconType: 'mci', iconMci: 'tree' },
    { type: 'Cabin', icon: 'home', iconType: 'mci', iconMci: 'home-variant-outline' },
    { type: 'Resort', icon: 'home', iconType: 'mci', iconMci: 'pool' },
    { type: 'Bungalow', icon: 'home', iconType: 'mci', iconMci: 'home-outline' },
    { type: 'Apartment', icon: 'home', iconType: 'mci', iconMci: 'apartment' },
    { type: 'Glamping/Camp', icon: 'home', iconType: 'mci', iconMci: 'tent' },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUploadPhoto = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setCoverPhoto(uri);
        setHasPhoto(true);
      }
    } catch (err) {
      console.error('Failed to pick cover photo', err);
      Alert.alert('Error', 'Failed to pick cover photo.');
    }
  };

  const handleContinue = () => {
    if (!propertyName || !city || !state || !pincode) {
      Alert.alert('Required Fields', 'Please fill in the Property Name, City, State, and Pincode.');
      return;
    }
    if (pincode.length !== 6) {
      Alert.alert('Invalid Pincode', 'Pincode must be exactly 6 digits.');
      return;
    }
    navigation.navigate('HostList2', {
      name: propertyName,
      tagline,
      type: selectedType,
      city,
      state,
      pincode,
      coverPhoto,
    });
  };

  const stepNumber = 1;
  const totalSteps = 5;
  const percentComplete = Math.round(
    ((stepNumber - 1) / totalSteps) * 100
  );

  return (
    <View style={styles.root}>
      {/* Dark Image Background Header with Asymmetrical Swoop */}
      <View style={styles.headerWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
          style={styles.headerBgImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <SafeAreaView style={styles.headerContent} edges={['top']}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtnCircle} onPress={handleBack} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepText}>STEP {stepNumber} OF {totalSteps}</Text>
              <Text style={styles.percentText}>{percentComplete}% COMPLETE</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFilled, { width: `${percentComplete}%` }]} />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>Tell us about your property</Text>
        <Text style={styles.subtitle}>Start with the basics to help guests find you</Text>

        {/* COVER PHOTO */}
        <Text style={styles.sectionLabel}>COVER PHOTO</Text>
        
        <TouchableOpacity
          style={[
            styles.uploadBox,
            hasPhoto && { borderColor: '#1A6B5A', backgroundColor: '#E6F2EF' }
          ]}
          onPress={handleUploadPhoto}
          activeOpacity={0.8}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <View style={styles.uploadIconCircle}>
                <MaterialCommunityIcons name="image-plus" size={28} color="#1A6B5A" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1F1E', marginBottom: 4 }}>
                Upload a cover photo
              </Text>
              <Text style={{ fontSize: 11, color: '#6B7370', textAlign: 'center' }}>
                Recommended size: 1280x860px
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* PROPERTY NAME WITH HOME ICON */}
        <Text style={styles.sectionLabel}>PROPERTY NAME</Text>
        <View style={styles.inputContainer}>
          <Feather name="home" size={20} color="#1A6B5A" style={styles.inputIcon} />
          <TextInput
            style={styles.inputField}
            placeholder="e.g. Whispering Oaks Cabin"
            placeholderTextColor="#6B7370"
            value={propertyName}
            onChangeText={setPropertyName}
          />
        </View>

        {/* TAGLINE WITH LEAF ICON & CHAR COUNT */}
        <Text style={styles.sectionLabel}>TAGLINE</Text>
        <View style={styles.multilineContainer}>
          <MaterialCommunityIcons name="leaf" size={20} color="#1A6B5A" style={styles.multilineIcon} />
          <TextInput
            style={styles.multilineField}
            placeholder="e.g. A century-old stone cottage nestled in the rolling hills, perfect for quiet retreats."
            placeholderTextColor="#6B7370"
            multiline
            maxLength={120}
            value={tagline}
            onChangeText={setTagline}
          />
          <Text style={styles.charCounter}>{tagline.length}/120</Text>
        </View>

        {/* PROPERTY TYPE CHIPS */}
        <Text style={styles.sectionLabel}>PROPERTY TYPE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {propertyTypes.map((item) => {
            const isActive = selectedType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                style={[styles.chipButton, isActive && styles.chipButtonActive]}
                onPress={() => setSelectedType(item.type)}
                activeOpacity={0.8}
              >
                {item.iconType === 'feather' ? (
                  <Feather name={item.icon as any} size={16} color={isActive ? '#1A6B5A' : '#6B7370'} />
                ) : (
                  <MaterialCommunityIcons name={item.iconMci as any} size={16} color={isActive ? '#1A6B5A' : '#6B7370'} />
                )}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {item.type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CITY & STATE */}
        <View style={styles.rowInputs}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>STATE</Text>
            <TouchableOpacity
              style={styles.inputTouchable}
              onPress={() => setStateModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.touchableText, !state && styles.placeholderText]}>
                {state || 'Select State'}
              </Text>
              <Feather name="chevron-down" size={16} color="#6B7370" />
            </TouchableOpacity>
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>CITY</Text>
            <TouchableOpacity
              style={styles.inputTouchable}
              onPress={() => {
                if (!state) {
                  Alert.alert('Select State', 'Please select a state first.');
                  return;
                }
                setCityModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.touchableText, !city && styles.placeholderText]}>
                {city || 'Select City'}
              </Text>
              <Feather name="chevron-down" size={16} color="#6B7370" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PINCODE */}
        <Text style={styles.sectionLabel}>PINCODE</Text>
        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={20} color="#1A6B5A" style={styles.inputIcon} />
          <TextInput
            style={styles.inputField}
            placeholder="e.g. 110001"
            placeholderTextColor="#6B7370"
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.continueButtonText}>Continue </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <SelectModal
        visible={stateModalVisible}
        title="Select State"
        options={INDIAN_STATES}
        selectedOption={state}
        onSelect={(val) => {
          setState(val);
          setCity(''); // Reset city when state changes
        }}
        onClose={() => setStateModalVisible(false)}
      />

      <SelectModal
        visible={cityModalVisible}
        title="Select City"
        options={state ? INDIAN_STATES_CITIES[state] || [] : []}
        selectedOption={city}
        onSelect={setCity}
        onClose={() => setCityModalVisible(false)}
      />
      </KeyboardAvoidingView>
    </View>
  );
}
