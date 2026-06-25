import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

type ListStep2RouteProp = RouteProp<RootStackParamList, 'HostList2'>;

export default function ListStep2Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ListStep2RouteProp>();
  const step1Data = route.params;

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
    navigation.navigate('HostList3', {
      ...step1Data,
      address,
      rooms,
      maxGuests,
      comfortableGuests: comfortGuests,
      pricePerNight: parseFloat(price) || 0,
      amenities: selectedAmenities,
      honestNotes,
    });
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderIcon = (amenity: AmenityType, isSelected: boolean) => {
    const color = isSelected ? '#D4704A' : '#1A1F1E';
    if (amenity.iconType === 'feather') {
      return <Feather name={amenity.iconName as React.ComponentProps<typeof Feather>['name']} size={24} color={color} />;
    } else {
      return <MaterialCommunityIcons name={amenity.iconName as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={24} color={color} />;
    }
  };

  const stepNumber = 2;
  const totalSteps = 5;
  const percentComplete = Math.round((stepNumber / totalSteps) * 100);

  return (
    <View style={styles.root}>
      {/* Dark Image Background Header */}
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
        <Text style={styles.title}>{i18n.t('host.listProperty.titleDetails') || 'Provide details about your property'}</Text>
        <Text style={styles.subtitle}>Provide technical details about your listing, capacity, pricing, and rules.</Text>

        {/* ADDRESS */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.address') || 'ADDRESS'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter complete physical address"
          placeholderTextColor="#6B7370"
          value={address}
          onChangeText={setAddress}
        />

        {/* CAPACITY */}
        <Text style={styles.sectionLabel}>{i18n.t('host.verification.capacity') || 'CAPACITY'}</Text>
        
        {/* Rooms Counter */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.rooms') || 'Rooms'}</Text>
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
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.maxGuests') || 'Max Guests'}</Text>
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
          <Text style={styles.capacityRowTitle}>{i18n.t('host.listProperty.comfortable') || 'Comfortable Guests'}</Text>
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
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.basePricePerNight') || 'BASE PRICE PER NIGHT'}</Text>
        <TextInput
          style={styles.input}
          placeholder="₹ Price"
          placeholderTextColor="#6B7370"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <Text style={styles.priceTip}>{i18n.t('host.listProperty.suggestedPrice') || 'Recommended price range based on similar homes.'}</Text>

        {/* AMENITIES */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.amenities') || 'AMENITIES'}</Text>
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
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.honestNotes') || 'HONEST NOTES'}</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder={i18n.t('host.listProperty.notesPlaceholder') || 'Any caveats or important rules...'}
          placeholderTextColor="#6B7370"
          multiline
          value={honestNotes}
          onChangeText={setHonestNotes}
        />

        {/* CONTINUE BUTTON */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>{i18n.t('host.listProperty.continue') || 'Continue'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
