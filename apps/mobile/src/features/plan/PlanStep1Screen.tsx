import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CalendarBottomSheet from './CalendarBottomSheet';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './PlanStep1Screen.styles';
import { apiGet } from '../../lib/api';

import PlanHeader from './PlanHeader';
import { AIInsightCard } from './AIInsightCard';

type PlanStep1Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep1'>;
};

interface DestinationChip {
  label: string;
  emoji: string;
}

const POPULAR_DESTINATIONS: DestinationChip[] = [
  { label: 'Goa', emoji: '🌴' },
  { label: 'Manali', emoji: '⛰' },
  { label: 'Kerala', emoji: '🌿' },
  { label: 'Rajasthan', emoji: '🏜' },
];

export default function PlanStep1Screen({ navigation }: PlanStep1Props) {
  const [destination, setDestination] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);

  const [suggestions, setSuggestions] = useState<Array<{ name: string; state: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllCitiesModal, setShowAllCitiesModal] = useState(false);
  const [allCities, setAllCities] = useState<Array<{ name: string; state: string }>>([]);

  useEffect(() => {
    if (!destination || destination.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await apiGet<{ cities: Array<{ name: string; state: string }> }>(
          `/locations/search?q=${encodeURIComponent(destination)}&limit=8`
        );
        setSuggestions(data.cities);
        setShowSuggestions(data.cities.length > 0);
      } catch (error) {
        console.error('City search failed:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destination]);

  const handleCitySelect = (cityName: string) => {
    setDestination(cityName);
    setSelectedChip(cityName);
    setShowSuggestions(false);
  };

  const handleShowAllCities = async () => {
    try {
      const data = await apiGet<{ cities: Array<{ name: string; state: string }> }>('/locations/all');
      setAllCities(data.cities);
      setShowAllCitiesModal(true);
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const [showCalendar, setShowCalendar] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderDateValue = (dateObj: Date | null, stringVal: string, placeholder: string) => {
    if (!stringVal) {
      return <Text style={styles.datePlaceholder}>{placeholder}</Text>;
    }
    if (dateObj) {
      const dayMonth = dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      const weekday = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
      });
      return (
        <View style={styles.dateValueContainer}>
          <Text style={styles.dateDayMonth}>{dayMonth}</Text>
          <Text style={styles.dateWeekday}>{weekday}</Text>
        </View>
      );
    }
    return <Text style={styles.dateValue}>{stringVal}</Text>;
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
    setShowCalendar(true);
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

  const getAIInsightText = () => {
    const destLower = destination.toLowerCase().trim();
    if (destLower.includes('goa')) {
      return 'Goa stays show high occupancy on weekends; booking 3 weeks ahead saves up to 25% on boutique villas.';
    }
    if (destLower.includes('manali')) {
      return 'Mountain properties with solar heating and fireplaces are currently seeing a 40% uptick in Manali reviews.';
    }
    if (destLower.includes('kerala')) {
      return 'Travelers visiting Kerala this season highly recommend heritage houseboats in Alappuzha over hotels.';
    }
    if (destLower.includes('rajasthan') || destLower.includes('jaipur')) {
      return 'Heritage havelis in Jaipur and Jodhpur offer complementary cultural walks that guests rate 4.9/5 stars.';
    }
    return 'Goa, Kerala & Manali are trending this week with 95% traveler satisfaction.';
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <PlanHeader
          step={1}
          imageUri="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"
          onBack={() => navigation.goBack()}
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Where do you want to go?</Text>

            {/* Destination Label */}
            <View style={styles.labelContainer}>
              <Feather name="map-pin" size={12} color="#1A6B5A" />
              <Text style={styles.label}>Destination</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Feather name="search" size={18} color="#1A6B5A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Goa, Manali, Kerala..."
                placeholderTextColor="#A0A5A3"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  setSelectedChip(null);
                }}
              />
            </View>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((city, idx) => (
                  <TouchableOpacity
                    key={`${city.name}-${idx}`}
                    style={styles.suggestionItem}
                    onPress={() => handleCitySelect(city.name)}
                  >
                    <Feather name="map-pin" size={14} color="#84C9BA" />
                    <View>
                      <Text style={styles.suggestionCity}>{city.name}</Text>
                      <Text style={styles.suggestionState}>{city.state}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Destination Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView} contentContainerStyle={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {POPULAR_DESTINATIONS.map((chip) => {
                  const isSelected = selectedChip === chip.label;
                  return (
                    <TouchableOpacity
                      key={chip.label}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleChipPress(chip.label)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {chip.emoji} {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity 
                  style={styles.arrowChip} 
                  activeOpacity={0.7}
                  onPress={handleShowAllCities}
                >
                  <Feather name="chevron-right" size={16} color="#1A1F1E" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* When Section */}
            <View style={styles.labelContainer}>
              <Feather name="calendar" size={12} color="#1A6B5A" />
              <Text style={styles.label}>When are you going?</Text>
            </View>

            <View style={styles.dateContainer}>
              <TouchableOpacity style={styles.dateBox} onPress={() => handleDateSelect('checkIn')} activeOpacity={0.7}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateLabel}>CHECK IN</Text>
                  <Feather name="calendar" size={14} color="#1A6B5A" />
                </View>
                {renderDateValue(checkInDate, checkIn, 'Select Date')}
              </TouchableOpacity>

              <Text style={styles.dateArrow}>→</Text>

              <TouchableOpacity style={styles.dateBox} onPress={() => handleDateSelect('checkOut')} activeOpacity={0.7}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateLabel}>CHECK OUT</Text>
                  <Feather name="calendar" size={14} color="#1A6B5A" />
                </View>
                {renderDateValue(checkOutDate, checkOut, 'Select Date')}
              </TouchableOpacity>
            </View>

            {/* Flexible Dates Toggle */}
            <View style={styles.flexibleToggleCard}>
              <View style={styles.flexibleLeft}>
                <View style={styles.sparkleCircle}>
                  <Feather name="star" size={16} color="#1A6B5A" />
                </View>
                <View>
                  <Text style={styles.flexibleTitle}>Flexible with dates?</Text>
                  <Text style={styles.flexibleSubtitle}>We'll find you the best deals</Text>
                </View>
              </View>
              <Switch
                value={isFlexible}
                onValueChange={setIsFlexible}
                trackColor={{ false: '#E8E2D9', true: '#1A6B5A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <AIInsightCard
              step={1}
              destination={destination}
              fallbackText={getAIInsightText()}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>

        <CalendarBottomSheet
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          destination={destination}
          onConfirm={(inDate, outDate) => {
            setCheckInDate(inDate);
            setCheckOutDate(outDate);
            setCheckIn(formatDate(inDate));
            setCheckOut(formatDate(outDate));
            setShowCalendar(false);
          }}
        />

        <Modal
          visible={showAllCitiesModal}
          animationType="slide"
          onRequestClose={() => setShowAllCitiesModal(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F4' }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Destinations</Text>
              <TouchableOpacity onPress={() => setShowAllCitiesModal(false)}>
                <Feather name="x" size={24} color="#1A1F1E" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={allCities}
              keyExtractor={(item, idx) => `${item.name}-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityRow}
                  onPress={() => {
                    setDestination(item.name);
                    setSelectedChip(item.name);
                    setShowAllCitiesModal(false);
                  }}
                >
                  <Feather name="map-pin" size={16} color="#84C9BA" />
                  <View>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityState}>{item.state}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
      </View>
    </View>
  );
}
