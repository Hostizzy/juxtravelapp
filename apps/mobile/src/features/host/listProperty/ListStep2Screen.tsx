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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep2Screen.styles';

type AmenityType = {
  id: string;
  label: string;
  iconType: 'feather' | 'mci';
  iconName: string;
};

export default function ListStep2Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // States
  const [address, setAddress] = useState<string>('');
  const [rooms, setRooms] = useState<number>(2);
  const [maxGuests, setMaxGuests] = useState<number>(4);
  const [comfortGuests, setComfortGuests] = useState<number>(2);
  const [price, setPrice] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['wifi', 'kitchen']);
  const [honestNotes, setHonestNotes] = useState<string>('');

  const amenities: AmenityType[] = [
    { id: 'wifi', label: 'WiFi', iconType: 'feather', iconName: 'wifi' },
    { id: 'kitchen', label: 'Kitchen', iconType: 'feather', iconName: 'coffee' },
    { id: 'parking', label: 'Parking', iconType: 'mci', iconName: 'car' },
    { id: 'ac', label: 'AC', iconType: 'mci', iconName: 'air-conditioner' },
    { id: 'pool', label: 'Pool', iconType: 'mci', iconName: 'pool' },
    { id: 'washing', label: 'Washing Machine', iconType: 'mci', iconName: 'washing-machine' },
    { id: 'hotwater', label: 'Hot Water', iconType: 'feather', iconName: 'droplet' },
    { id: 'tv', label: 'TV', iconType: 'feather', iconName: 'tv' },
    { id: 'garden', label: 'Garden', iconType: 'mci', iconName: 'flower' },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (!address || !price) {
      Alert.alert('Required Fields', 'Please fill in the Address and Base Price per night.');
      return;
    }
    navigation.navigate('HostList3' as any);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderIcon = (amenity: AmenityType, isSelected: boolean) => {
    const color = isSelected ? '#D4704A' : '#1A1F1E';
    if (amenity.iconType === 'feather') {
      return <Feather name={amenity.iconName as any} size={24} color={color} />;
    } else {
      return <MaterialCommunityIcons name={amenity.iconName as any} size={24} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Progress Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>STEP 2 OF 5</Text>
          <Text style={styles.percentText}>40% COMPLETE</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFilled, { width: '40%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{i18n.t('host.listProperty.titleDetails')}</Text>
        <Text style={styles.subtitle}>Provide technical details about your listing, capacity, pricing, and rules.</Text>

        {/* ADDRESS */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.address')}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter complete physical address"
          placeholderTextColor="#6B7370"
          value={address}
          onChangeText={setAddress}
        />

        {/* CAPACITY */}
        <Text style={styles.sectionLabel}>{i18n.t('host.verification.capacity')}</Text>
        
        {/* Rooms Counter */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.rooms')}</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => setRooms((r) => Math.max(1, r - 1))}>
              <View style={styles.counterBtnMinus}>
                <Text style={styles.counterBtnTextMinus}>−</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{rooms}</Text>
            <TouchableOpacity onPress={() => setRooms((r) => r + 1)}>
              <View style={styles.counterBtnPlus}>
                <Text style={styles.counterBtnTextPlus}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Max Guests Counter */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.maxGuests')}</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => setMaxGuests((g) => Math.max(1, g - 1))}>
              <View style={styles.counterBtnMinus}>
                <Text style={styles.counterBtnTextMinus}>−</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{maxGuests}</Text>
            <TouchableOpacity onPress={() => setMaxGuests((g) => g + 1)}>
              <View style={styles.counterBtnPlus}>
                <Text style={styles.counterBtnTextPlus}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comfortable Guests Counter */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.comfortable')}</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => setComfortGuests((g) => Math.max(1, g - 1))}>
              <View style={styles.counterBtnMinus}>
                <Text style={styles.counterBtnTextMinus}>−</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{comfortGuests}</Text>
            <TouchableOpacity onPress={() => setComfortGuests((g) => g + 1)}>
              <View style={styles.counterBtnPlus}>
                <Text style={styles.counterBtnTextPlus}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* BASE PRICE */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.basePricePerNight')}</Text>
        <TextInput
          style={styles.input}
          placeholder="₹ Price"
          placeholderTextColor="#6B7370"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <Text style={styles.priceTip}>{i18n.t('host.listProperty.suggestedPrice')}</Text>

        {/* AMENITIES */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.amenities')}</Text>
        <View style={styles.amenitiesGrid}>
          {amenities.map((item) => {
            const isSelected = selectedAmenities.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.amenityCard,
                  isSelected ? styles.amenitySelected : styles.amenityUnselected,
                ]}
                onPress={() => toggleAmenity(item.id)}
                activeOpacity={0.8}
              >
                {renderIcon(item, isSelected)}
                <Text
                  style={[
                    styles.amenityText,
                    isSelected ? styles.amenityTextSelected : styles.amenityTextUnselected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* HONEST NOTES */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.honestNotes')}</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder={i18n.t('host.listProperty.notesPlaceholder')}
          placeholderTextColor="#6B7370"
          multiline
          value={honestNotes}
          onChangeText={setHonestNotes}
        />

        {/* CONTINUE BUTTON */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>{i18n.t('host.listProperty.continue')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
