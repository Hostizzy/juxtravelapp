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
import styles from './HostVerificationScreen.styles';

type CategoryType = 'Homestay' | 'Farmstay' | 'Villa' | 'Eco-Lodge' | 'Cottage';

export default function HostVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Form states
  const [ownership, setOwnership] = useState<'own' | 'manage'>('own');
  const [category, setCategory] = useState<CategoryType>('Homestay');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [maxCapacity, setMaxCapacity] = useState<number>(4);
  const [comfortCapacity, setComfortCapacity] = useState<number>(2);
  const [hasDoc, setHasDoc] = useState<boolean>(false);

  const categories: CategoryType[] = ['Homestay', 'Farmstay', 'Villa', 'Eco-Lodge', 'Cottage'];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUploadPress = () => {
    setHasDoc(true);
    Alert.alert('Success', 'Document selected and prepared for upload!');
  };

  const handleContinue = () => {
    if (!city) {
      Alert.alert('Required Field', 'Please enter your property city/location.');
      return;
    }
    navigation.navigate('HostWelcome' as any);
  };

  const adjustMax = (change: number) => {
    setMaxCapacity((prev) => Math.max(1, prev + change));
  };

  const adjustComfort = (change: number) => {
    setComfortCapacity((prev) => Math.max(1, prev + change));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1A1F1E" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{i18n.t('host.verification.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECTION 1: OWNERSHIP */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('host.verification.ownership')}</Text>
          <Text style={styles.sectionQuestion}>{i18n.t('host.verification.manageQuestion')}</Text>
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[
                styles.ownershipBtn,
                ownership === 'own' ? styles.ownershipBtnSelected : styles.ownershipBtnUnselected,
              ]}
              onPress={() => setOwnership('own')}
              activeOpacity={0.8}
            >
              <Text
                style={
                  ownership === 'own'
                    ? styles.ownershipBtnTextSelected
                    : styles.ownershipBtnTextUnselected
                }
              >
                {i18n.t('host.verification.ownIt')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ownershipBtn,
                ownership === 'manage' ? styles.ownershipBtnSelected : styles.ownershipBtnUnselected,
              ]}
              onPress={() => setOwnership('manage')}
              activeOpacity={0.8}
            >
              <Text
                style={
                  ownership === 'manage'
                    ? styles.ownershipBtnTextSelected
                    : styles.ownershipBtnTextUnselected
                }
              >
                {i18n.t('host.verification.manageIt')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 2: CATEGORY */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('host.verification.category')}</Text>
          <Text style={styles.sectionSublabel}>{i18n.t('host.verification.propertyType')}</Text>
          <View style={styles.chipsWrap}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  category === cat ? styles.chipSelected : styles.chipUnselected,
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    category === cat ? styles.chipTextSelected : styles.chipTextUnselected
                  }
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 3: LOCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('host.verification.location')}</Text>
          <Text style={styles.sectionQuestion}>{i18n.t('host.verification.whereQuestion')}</Text>
          
          <TextInput
            style={styles.inputField}
            placeholder={i18n.t('host.verification.cityPlaceholder')}
            placeholderTextColor="#6B7370"
            value={city}
            onChangeText={setCity}
          />

          <TouchableOpacity 
            style={[styles.inputField, styles.dropdownField]}
            onPress={() => {
              Alert.alert('Dropdown', 'Select State coming soon!');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>
              {state ? state : i18n.t('host.verification.selectState')}
            </Text>
            <Feather name="chevron-down" size={20} color="#6B7370" />
          </TouchableOpacity>
        </View>

        {/* SECTION 4: CAPACITY */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('host.verification.capacity')}</Text>
          <Text style={styles.sectionQuestion}>{i18n.t('host.verification.capacityQuestion')}</Text>
          
          {/* Max Capacity */}
          <View style={styles.capacityRow}>
            <View style={styles.capacityLabelCol}>
              <Text style={styles.capacityRowTitle}>{i18n.t('host.verification.maxCapacity')}</Text>
              <Text style={styles.capacityRowSub}>{i18n.t('host.verification.maxCapacitySub')}</Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity style={styles.counterContainer} onPress={() => adjustMax(-1)}>
                <View style={styles.counterBtnMinus}>
                  <Text style={styles.counterBtnTextMinus}>−</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{maxCapacity}</Text>
              <TouchableOpacity style={styles.counterContainer} onPress={() => adjustMax(1)}>
                <View style={styles.counterBtnPlus}>
                  <Text style={styles.counterBtnTextPlus}>+</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comfortable Capacity */}
          <View style={styles.capacityRow}>
            <View style={styles.capacityLabelCol}>
              <Text style={styles.capacityRowTitle}>{i18n.t('host.verification.comfortableCapacity')}</Text>
              <Text style={styles.capacityRowSub}>{i18n.t('host.verification.comfortableCapacitySub')}</Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity style={styles.counterContainer} onPress={() => adjustComfort(-1)}>
                <View style={styles.counterBtnMinus}>
                  <Text style={styles.counterBtnTextMinus}>−</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{comfortCapacity}</Text>
              <TouchableOpacity style={styles.counterContainer} onPress={() => adjustComfort(1)}>
                <View style={styles.counterBtnPlus}>
                  <Text style={styles.counterBtnTextPlus}>+</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 5: DOCUMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('host.verification.documents')}</Text>
          <Text style={styles.sectionQuestion}>{i18n.t('host.verification.uploadOne')}</Text>
          
          <TouchableOpacity 
            style={[
              styles.uploadBox,
              hasDoc && { borderColor: '#2D8F5E', backgroundColor: '#F0F9F5' }
            ]} 
            onPress={handleUploadPress}
            activeOpacity={0.7}
          >
            <Feather 
              name={hasDoc ? "check" : "upload"} 
              size={32} 
              color={hasDoc ? "#2D8F5E" : "#6B7370"} 
            />
            <Text style={[styles.uploadTitle, hasDoc && { color: '#2D8F5E' }]}>
              {hasDoc ? 'Document Selected ✓' : i18n.t('host.verification.tapToUpload')}
            </Text>
            <Text style={styles.uploadSub}>{i18n.t('host.verification.uploadSub')}</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM ACTION BUTTON */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>{i18n.t('host.verification.continue')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
