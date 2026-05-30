import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep1Screen.styles';

type PropertyType = 'Homestay' | 'Farmstay' | 'Villa' | 'Boutique Hotel' | 'Cottage';

export default function ListStep1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // States
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [propertyName, setPropertyName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PropertyType>('Homestay');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');

  const propertyTypes: PropertyType[] = ['Homestay', 'Farmstay', 'Villa', 'Boutique Hotel', 'Cottage'];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUploadPhoto = () => {
    setHasPhoto(true);
    Alert.alert('Success', 'Cover photo selected!');
  };

  const handleContinue = () => {
    if (!propertyName || !city || !state) {
      Alert.alert('Required Fields', 'Please fill in the Property Name, City, and State.');
      return;
    }
    navigation.navigate('HostList2' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Shared Progress Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>STEP 1 OF 5</Text>
          <Text style={styles.percentText}>20% COMPLETE</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFilled, { width: '20%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{i18n.t('host.listProperty.stepTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.listProperty.stepSub')}</Text>

        {/* COVER PHOTO */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.coverPhoto')}</Text>
        <TouchableOpacity
          style={[
            styles.uploadBox,
            hasPhoto && { borderColor: '#2D8F5E', backgroundColor: '#F0F9F5' }
          ]}
          onPress={handleUploadPhoto}
          activeOpacity={0.8}
        >
          <Feather 
            name={hasPhoto ? "check" : "camera"} 
            size={32} 
            color={hasPhoto ? "#2D8F5E" : "#6B7370"} 
          />
          <Text style={[styles.uploadTip, hasPhoto && { color: '#2D8F5E' }]}>
            {hasPhoto ? 'Cover Photo Selected ✓' : i18n.t('host.listProperty.recommendedSize')}
          </Text>
        </TouchableOpacity>

        {/* PROPERTY NAME */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('host.listProperty.namePlaceholder')}
          placeholderTextColor="#6B7370"
          value={propertyName}
          onChangeText={setPropertyName}
        />

        {/* TAGLINE */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.tagline')}</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder={i18n.t('host.listProperty.taglinePlaceholder')}
          placeholderTextColor="#6B7370"
          multiline
          value={tagline}
          onChangeText={setTagline}
        />

        {/* PROPERTY TYPE */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.propertyType')}</Text>
        <View style={styles.chipsWrap}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                selectedType === type ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  selectedType === type
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected
                }
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CITY & STATE */}
        <View style={styles.rowInputs}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.city')}</Text>
            <TextInput
              style={styles.input}
              placeholder="eg. Manali"
              placeholderTextColor="#6B7370"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.state')}</Text>
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
          <Text style={styles.continueButtonText}>{i18n.t('host.listProperty.continue')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
