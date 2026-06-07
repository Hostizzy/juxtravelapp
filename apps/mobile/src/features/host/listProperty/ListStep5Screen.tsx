import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import { uploadPhoto, submitProperty } from '../../../services/propertyService';
import styles from './ListStep5Screen.styles';

type PolicyType = 'flexible' | 'moderate' | 'strict';

interface CalendarDay {
  dayNum: number;
  isEmpty: boolean;
  isBooked?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
}

type ListStep5RouteProp = RouteProp<RootStackParamList, 'HostList5'>;

export default function ListStep5Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ListStep5RouteProp>();
  const allData = route.params;

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [availableUnits, setAvailableUnits] = useState<boolean>(true);
  const [minStay, setMinStay] = useState<number>(2);
  const [basePrice, setBasePrice] = useState<string>(
    allData?.pricePerNight ? allData.pricePerNight.toString() : '4500'
  );
  const [weekendEnabled, setWeekendEnabled] = useState<boolean>(false);
  const [weekendPrice, setWeekendPrice] = useState<string>('5500');
  const [policy, setPolicy] = useState<PolicyType>('flexible');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const toggleDate = (dateStr: string) => {
    setBlockedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Weekday of first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Sunday of the first week
    const gridStartDate = new Date(year, month, 1 - startDayOfWeek);

    const cells = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + i);
      const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const isCurrentMonth = cellDate.getMonth() === month && cellDate.getFullYear() === year;
      const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();
      const isBlocked = blockedDates.includes(dateStr);

      cells.push({
        date: cellDate,
        dateStr,
        dayNum: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        isBlocked,
      });
    }

    return cells;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = generateCalendarDays();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your listing progress has been saved as a draft.');
    navigation.replace('HostApp');
  };

  const handleSubmitReview = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1. Upload cover photo if present
      let uploadedCoverUrl = '';
      if (allData.coverPhoto) {
        console.log('Uploading cover photo:', allData.coverPhoto);
        const url = await uploadPhoto(allData.coverPhoto);
        if (!url) {
          Alert.alert('Upload Failed', 'Failed to upload cover photo. Please try again.');
          setLoading(false);
          return;
        }
        uploadedCoverUrl = url;
      }

      // 2. Upload other photos
      const uploadedUrls: string[] = [];
      if (allData.photos && allData.photos.length > 0) {
        console.log(`Uploading ${allData.photos.length} photos...`);
        for (const photoUri of allData.photos) {
          const url = await uploadPhoto(photoUri);
          if (url) {
            uploadedUrls.push(url);
          } else {
            Alert.alert('Upload Failed', 'Failed to upload one of the property photos. Please try again.');
            setLoading(false);
            return;
          }
        }
      }

      // 3. Submit to backend
      const result = await submitProperty({
        name: allData.name,
        tagline: allData.tagline,
        type: allData.type,
        city: allData.city,
        state: allData.state,
        coverPhoto: uploadedCoverUrl || undefined,
        address: allData.address,
        maxGuests: allData.maxGuests,
        rooms: allData.rooms,
        comfortableGuests: allData.comfortableGuests,
        pricePerNight: parseFloat(basePrice) || 0,
        amenities: allData.amenities,
        honestNotes: allData.honestNotes,
        photos: uploadedUrls,
        activities: allData.activities,
        hostStory: allData.hostStory,
        minimumStay: minStay,
        weekendPrice: weekendEnabled ? (parseFloat(weekendPrice) || 0) : 0,
        cancellationPolicy: policy,
      });

      if (result.success) {
        navigation.navigate('HostReviewPending');
      } else {
        Alert.alert('Error', result.error || 'Failed to submit property.');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      Alert.alert('Error', 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Shared Progress Header */}
        <View style={styles.topBar}>
          <View style={styles.topBarRow}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={handleBack} 
              activeOpacity={0.7}
              disabled={loading}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>STEP 5 OF 5</Text>
            <Text style={styles.percentText}>100% COMPLETE</Text>
          </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFilled, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{i18n.t('host.listProperty.availabilityTitle')}</Text>

        {/* AVAILABLE UNITS TOGGLE */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{i18n.t('host.listProperty.availableUnits')}</Text>
          <Switch
            trackColor={{ false: '#E8E2D9', true: '#FAF8F4' }}
            thumbColor={availableUnits ? '#D4704A' : '#6B7370'}
            ios_backgroundColor="#E8E2D9"
            onValueChange={setAvailableUnits}
            value={availableUnits}
          />
        </View>

        {/* AVAILABILITY CALENDAR */}
        <Text style={styles.sectionLabel}>AVAILABILITY CALENDAR</Text>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Feather name="chevron-left" size={20} color="#1A1F1E" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Feather name="chevron-right" size={20} color="#1A1F1E" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.daysOfWeek}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <Text key={idx} style={styles.dayOfWeekText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.dayCell}
                onPress={() => toggleDate(day.dateStr)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.dayCircle,
                  day.isBlocked && styles.dayBlocked,
                  day.isToday && styles.dayToday,
                  !day.isCurrentMonth && styles.dayOtherMonth
                ]}>
                  <Text style={[
                    styles.dayText,
                    day.isBlocked && styles.dayBlockedText
                  ]}>
                    {day.dayNum}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MINIMUM STAY */}
        <View style={styles.counterRow}>
          <View>
            <Text style={styles.counterTitle}>{i18n.t('host.listProperty.minStay')}</Text>
            <Text style={styles.requiredNights}>{i18n.t('host.listProperty.requiredNights')}</Text>
          </View>
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => setMinStay((s) => Math.max(1, s - 1))}>
              <View style={styles.counterBtnMinus}>
                <Text style={styles.counterBtnTextMinus}>−</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{minStay}</Text>
            <TouchableOpacity onPress={() => setMinStay((s) => s + 1)}>
              <View style={styles.counterBtnPlus}>
                <Text style={styles.counterBtnTextPlus}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRICING INPUTS */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.basePricePerNight')}</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputCurrency}>₹</Text>
          <TextInput
            style={styles.textInput}
            placeholder="eg. 4500"
            keyboardType="numeric"
            value={basePrice}
            onChangeText={setBasePrice}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{i18n.t('host.listProperty.weekendPricing')}</Text>
          <Switch
            trackColor={{ false: '#E8E2D9', true: '#FAF8F4' }}
            thumbColor={weekendEnabled ? '#D4704A' : '#6B7370'}
            ios_backgroundColor="#E8E2D9"
            onValueChange={setWeekendEnabled}
            value={weekendEnabled}
          />
        </View>

        {weekendEnabled && (
          <View style={styles.inputRow}>
            <Text style={styles.inputCurrency}>₹</Text>
            <TextInput
              style={styles.textInput}
              placeholder="eg. 5500"
              keyboardType="numeric"
              value={weekendPrice}
              onChangeText={setWeekendPrice}
            />
          </View>
        )}

        {/* CANCELLATION POLICY */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.cancellationPolicy')}</Text>
        
        {/* Flexible */}
        <TouchableOpacity
          style={[styles.radioOption, policy === 'flexible' && styles.radioSelected]}
          onPress={() => setPolicy('flexible')}
          activeOpacity={0.8}
        >
          <View style={[styles.radioCircle, policy === 'flexible' && styles.radioCircleSelected]}>
            {policy === 'flexible' && <View style={styles.radioInnerCircle} />}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioTitle}>Flexible</Text>
            <Text style={styles.radioDesc}>{i18n.t('host.listProperty.policyFlexible')}</Text>
          </View>
        </TouchableOpacity>

        {/* Moderate */}
        <TouchableOpacity
          style={[styles.radioOption, policy === 'moderate' && styles.radioSelected]}
          onPress={() => setPolicy('moderate')}
          activeOpacity={0.8}
        >
          <View style={[styles.radioCircle, policy === 'moderate' && styles.radioCircleSelected]}>
            {policy === 'moderate' && <View style={styles.radioInnerCircle} />}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioTitle}>Moderate</Text>
            <Text style={styles.radioDesc}>{i18n.t('host.listProperty.policyModerate')}</Text>
          </View>
        </TouchableOpacity>

        {/* Strict */}
        <TouchableOpacity
          style={[styles.radioOption, policy === 'strict' && styles.radioSelected]}
          onPress={() => setPolicy('strict')}
          activeOpacity={0.8}
        >
          <View style={[styles.radioCircle, policy === 'strict' && styles.radioCircleSelected]}>
            {policy === 'strict' && <View style={styles.radioInnerCircle} />}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioTitle}>Strict</Text>
            <Text style={styles.radioDesc}>{i18n.t('host.listProperty.policyStrict')}</Text>
          </View>
        </TouchableOpacity>

        {/* BOTTOM ACTIONS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity 
            style={[styles.outlineBtn, loading && { opacity: 0.5 }]} 
            onPress={handleSaveDraft} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.outlineBtnText}>{i18n.t('host.listProperty.saveDraft')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmitReview} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{i18n.t('host.listProperty.submitReview')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>
);
}
