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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { pickImage } from '../../../services/propertyService';
import i18n from '../../../locales/i18n';
import styles from './ListStep1Screen.styles';

type PropertyType = 'Homestay' | 'Farmstay' | 'Villa';

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

  const propertyTypes: { type: PropertyType; icon: keyof typeof Feather.glyphMap; iconType: 'feather' | 'mci'; iconMci?: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { type: 'Homestay', icon: 'home', iconType: 'feather' },
    { type: 'Farmstay', icon: 'home', iconType: 'mci', iconMci: 'sprout' },
    { type: 'Villa', icon: 'home', iconType: 'mci', iconMci: 'office-building' },
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
    if (!propertyName || !city || !state) {
      Alert.alert('Required Fields', 'Please fill in the Property Name, City, and State.');
      return;
    }
    navigation.navigate('HostList2', {
      name: propertyName,
      tagline,
      type: selectedType,
      city,
      state,
      coverPhoto,
    });
  };

  const stepNumber = 1;
  const totalSteps = 5;
  const percentComplete = Math.round((stepNumber / totalSteps) * 100);

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          <Feather name="leaf" size={20} color="#1A6B5A" style={styles.multilineIcon} />
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
        <View style={styles.chipsContainer}>
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
                  <Feather name={item.icon} size={16} color={isActive ? '#1A6B5A' : '#6B7370'} />
                ) : (
                  <MaterialCommunityIcons name={item.iconMci!} size={16} color={isActive ? '#1A6B5A' : '#6B7370'} />
                )}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {item.type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CITY & STATE */}
        <View style={styles.rowInputs}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>CITY</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. Manali"
              placeholderTextColor="#6B7370"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>STATE</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. HP"
              placeholderTextColor="#6B7370"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.continueButtonText}>Continue </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
