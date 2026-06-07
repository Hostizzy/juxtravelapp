import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../navigation/RootNavigator';
import i18n from '../../locales/i18n';
import styles from './PlanStep1Screen.styles';

type PlanStep1Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep1'>;
};

const POPULAR_DESTINATIONS = [
  'Goa',
  'Manali',
  'Kerala',
  'Rajasthan',
  'Uttarakhand',
  'Himachal',
];

export default function PlanStep1Screen({ navigation }: PlanStep1Props) {
  const [destination, setDestination] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleChipPress = (chip: string) => {
    if (selectedChip === chip) {
      setSelectedChip(null);
      setDestination('');
    } else {
      setSelectedChip(chip);
      setDestination(chip);
    }
  };

  const handleDateSelect = (type: 'checkIn' | 'checkOut') => {
    if (type === 'checkIn') {
      setShowCheckIn(true);
    } else {
      setShowCheckOut(true);
    }
  };

  const handleContinue = () => {
    const finalDestination = destination.trim() || selectedChip || '';
    if (!finalDestination) {
      Alert.alert('Destination Required', 'Please enter or select a destination.');
      return;
    }
    if (!checkIn || !checkOut) {
      Alert.alert('Dates Required', 'Please select check-in and check-out dates.');
      return;
    }
    navigation.navigate('PlanStep2', {
      destination: finalDestination,
      checkIn,
      checkOut,
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>STEP 1 OF 4</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{i18n.t('plan.step1.title')}</Text>

            {/* Destination Label */}
            <Text style={styles.label}>{i18n.t('plan.step1.destinationLabel')}</Text>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Feather name="map-pin" size={18} color="#1A6B5A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={i18n.t('plan.step1.destinationPlaceholder')}
                placeholderTextColor="#A0A5A3"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  setSelectedChip(null);
                }}
              />
            </View>

            {/* Popular Destination Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {POPULAR_DESTINATIONS.map((place) => (
                  <TouchableOpacity
                    key={place}
                    style={[styles.chip, selectedChip === place && styles.chipSelected]}
                    onPress={() => handleChipPress(place)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedChip === place && styles.chipTextSelected]}>
                      {place}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* When Section */}
            <Text style={styles.label}>{i18n.t('plan.step1.whenLabel')}</Text>

            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.dateBox} onPress={() => handleDateSelect('checkIn')} activeOpacity={0.7}>
                <Text style={styles.dateLabel}>{i18n.t('plan.step1.checkIn')}</Text>
                <Text style={[styles.dateValue, !checkIn && styles.datePlaceholder]}>
                  {checkIn || i18n.t('plan.step1.selectDate')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dateBox} onPress={() => handleDateSelect('checkOut')} activeOpacity={0.7}>
                <Text style={styles.dateLabel}>{i18n.t('plan.step1.checkOut')}</Text>
                <Text style={[styles.dateValue, !checkOut && styles.datePlaceholder]}>
                  {checkOut || i18n.t('plan.step1.selectDate')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueButtonText}>{i18n.t('plan.step1.continueBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {showCheckIn && (
          <DateTimePicker
            value={checkInDate ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowCheckIn(false);
              if (date) {
                setCheckInDate(date);
                setCheckIn(formatDate(date));
              }
            }}
          />
        )}

        {showCheckOut && (
          <DateTimePicker
            value={checkOutDate ?? new Date()}
            mode="date"
            minimumDate={checkInDate ?? new Date()}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowCheckOut(false);
              if (date) {
                setCheckOutDate(date);
                setCheckOut(formatDate(date));
              }
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
