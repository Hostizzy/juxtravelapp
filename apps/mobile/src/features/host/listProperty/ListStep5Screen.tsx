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
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import { uploadPhoto } from '../../../services/propertyService';
import { apiPatch } from '../../../lib/api';
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

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
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

  const proceedWithSubmission = async (urls: string[], coverUrl: string) => {
    setLoading(true);
    try {
      const propertyId = allData.propertyId;
      
      if (!propertyId) {
        Alert.alert('Error', 'Property ID missing. Please restart listing.');
        return;
      }

      await apiPatch(`/properties/${propertyId}`, {
        name: allData.name,
        tagline: allData.tagline,
        type: allData.type,
        location: {
          address: allData.address,
          city: allData.city,
          state: allData.state,
          pincode: allData.pincode,
        },
        capacity: {
          rooms: allData.rooms,
          maxGuests: allData.maxGuests,
          comfortableGuests: allData.comfortableGuests,
          bathrooms: allData.bathrooms,
          beds: allData.beds,
        },
        pricePerNight: parseFloat(basePrice) || 0,
        weekendPrice: weekendEnabled ? (parseFloat(weekendPrice) || 0) : 0,
        amenities: allData.amenities,
        activities: allData.activities,
        honestNotes: allData.honestNotes,
        hostStory: allData.hostStory,
        photos: urls.length > 0 ? urls : (coverUrl ? [coverUrl] : []),
        minimumStay: minStay,
        cancellationPolicy: policy,
        status: 'under_review',
      });

      navigation.navigate('HostReviewPending', {
        propertyId: propertyId,
        propertyName: allData.name,
        propertyPhoto: coverUrl || urls[0] || '',
        propertyType: allData.type,
        propertyCity: allData.city,
      });
    } catch (error) {
      console.error('Submission failed:', error);
      Alert.alert('Error', 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
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
          // Don't block - show warning, let user decide
          const proceed = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Cover Photo Upload Failed',
              'We could not upload your cover photo due to a network issue. You can submit without it for now and add it later from your property settings, or go back and check your connection.',
              [
                { text: 'Go Back', onPress: () => resolve(false), style: 'cancel' },
                { text: 'Submit Without Cover Photo', onPress: () => resolve(true) },
              ]
            );
          });
          if (!proceed) {
            setLoading(false);
            return;
          }
          // uploadedCoverUrl stays empty string, submission continues
        } else {
          uploadedCoverUrl = url;
        }
      }

      // 2. Upload other photos
      const uploadedUrls: string[] = [];
      const failedUploads: number[] = [];

      if (allData.photos && allData.photos.length > 0) {
        console.log(`Uploading ${allData.photos.length} photos...`);
        for (let i = 0; i < allData.photos.length; i++) {
          const url = await uploadPhoto(allData.photos[i]);
          if (url) {
            uploadedUrls.push(url);
          } else {
            failedUploads.push(i + 1);
          }
        }
      }

      if (failedUploads.length > 0) {
        Alert.alert(
          'Some photos failed',
          `Photo(s) ${failedUploads.join(', ')} could not be uploaded due to a network issue. You can continue without them or go back and retry.`,
          [
            { text: 'Go Back', style: 'cancel' },
            { 
              text: 'Continue Anyway', 
              onPress: () => proceedWithSubmission(uploadedUrls, uploadedCoverUrl) 
            },
          ]
        );
        setLoading(false);
        return;
      }

      // If no failures, proceed normally
      await proceedWithSubmission(uploadedUrls, uploadedCoverUrl);
    } catch (error) {
      console.error('Submission failed:', error);
      Alert.alert('Error', 'Failed to submit. Try again.');
      setLoading(false);
    }
  };

  const stepNumber = 5;
  const totalSteps = 5;
  const percentComplete = Math.round(
    ((stepNumber - 1) / totalSteps) * 100
  );

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
              <TouchableOpacity 
                style={styles.backBtnCircle} 
                onPress={handleBack} 
                activeOpacity={0.7}
                disabled={loading}
              >
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
        <Text style={styles.title}>{i18n.t('host.listProperty.availabilityTitle') || 'Set availability and rules'}</Text>

        {/* AVAILABLE UNITS TOGGLE */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{i18n.t('host.listProperty.availableUnits') || 'Available Units'}</Text>
          <Switch
            trackColor={{ false: '#E8E2D9', true: '#1A6B5A' }}
            thumbColor="#FFFFFF"
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
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
              <Text key={idx} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((cell, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayCell, !cell.isCurrentMonth && styles.dayOtherMonth]}
                  disabled={!cell.isCurrentMonth}
                  onPress={() => toggleDate(cell.dateStr)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.dayCircle,
                    cell.isBlocked && styles.dayBlocked,
                    cell.isToday && !cell.isBlocked && styles.dayToday
                  ]}>
                    <Text style={[
                      styles.dayText,
                      cell.isBlocked && styles.dayBlockedText
                    ]}>
                      {cell.dayNum}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* MINIMUM STAY */}
        <View style={styles.counterRow}>
          <View>
            <Text style={styles.counterTitle}>{i18n.t('host.listProperty.minimumStay') || 'Minimum Stay'}</Text>
            <Text style={styles.requiredNights}>{i18n.t('host.listProperty.minimumStaySubtext') || 'required nights'}</Text>
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

        {/* WEEKEND PRICING */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{i18n.t('host.listProperty.weekendPricing') || 'Weekend Pricing'}</Text>
          <Switch
            trackColor={{ false: '#E8E2D9', true: '#1A6B5A' }}
            thumbColor="#FFFFFF"
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
              keyboardType="numeric"
              placeholder="Weekend price per night"
              placeholderTextColor="#6B7370"
              value={weekendPrice}
              onChangeText={weekendPrice ? setWeekendPrice : undefined}
            />
          </View>
        )}

        {/* CANCELLATION POLICY */}
        <Text style={styles.sectionLabel}>CANCELLATION POLICY</Text>
        
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
            <Text style={styles.radioDesc}>Full refund 1 day prior to arrival, except fees.</Text>
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
            <Text style={styles.radioDesc}>Full refund 5 days prior to arrival, except fees.</Text>
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
            <Text style={styles.radioDesc}>50% refund up until 1 week prior to arrival, except fees.</Text>
          </View>
        </TouchableOpacity>

        {/* BOTTOM NAV ROWS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity 
            style={styles.outlineBtn} 
            onPress={handleBack} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>{i18n.t('host.listProperty.back') || 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmitReview} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{i18n.t('host.listProperty.submitReview') || 'Submit for Review'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
