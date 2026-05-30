import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep5Screen.styles';

type PolicyType = 'flexible' | 'moderate' | 'strict';

interface CalendarDay {
  dayNum: number;
  isEmpty: boolean;
  isBooked?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
}

export default function ListStep5Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // States
  const [availableUnits, setAvailableUnits] = useState<boolean>(true);
  const [minStay, setMinStay] = useState<number>(2);
  const [basePrice, setBasePrice] = useState<string>('4500');
  const [weekendEnabled, setWeekendEnabled] = useState<boolean>(false);
  const [weekendPrice, setWeekendPrice] = useState<string>('5500');
  const [policy, setPolicy] = useState<PolicyType>('flexible');

  // October 2023 mock calendar grid
  // Starts on Sunday (1st is Sunday)
  const days: CalendarDay[] = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      dayNum: day,
      isEmpty: false,
      isBooked: [4, 5, 12, 13, 14, 25].includes(day),
      isSelected: [18, 19, 20].includes(day),
      isToday: day === 28,
    };
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your listing progress has been saved as a draft.');
    navigation.replace('HostApp' as any);
  };

  const handleSubmitReview = () => {
    navigation.navigate('HostReviewPending' as any);
  };

  const getDayStyleAndText = (day: CalendarDay) => {
    if (day.isEmpty) {
      return { style: styles.dayEmpty, textStyle: null };
    }
    if (day.isSelected) {
      return { style: styles.daySelected, textStyle: styles.daySelectedText };
    }
    if (day.isBooked) {
      return { style: styles.dayBooked, textStyle: styles.dayBookedText };
    }
    const todayBorder = day.isToday ? styles.dayToday : null;
    return { style: [styles.dayAvailable, todayBorder], textStyle: styles.dayAvailableText };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Shared Progress Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
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

        {/* MOCK CALENDAR */}
        <Text style={styles.sectionLabel}>AVAILABILITY CALENDAR</Text>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => Alert.alert('Calendar', 'Previous month')}>
              <Feather name="chevron-left" size={20} color="#1A1F1E" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>October 2023</Text>
            <TouchableOpacity onPress={() => Alert.alert('Calendar', 'Next month')}>
              <Feather name="chevron-right" size={20} color="#1A1F1E" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekdaysRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {days.map((day, idx) => {
              const { style, textStyle } = getDayStyleAndText(day);
              return (
                <View key={idx} style={[styles.dayItem, style]}>
                  <Text style={[styles.dayText, textStyle]}>{day.dayNum}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* MINIMUM STAY */}
        <View style={styles.counterRow}>
          <View>
            <Text style={styles.counterTitle}>{i18n.t('host.listProperty.minStay')}</Text>
            <Text style={{ fontSize: 12, color: '#6B7370', marginTop: 2 }}>{i18n.t('host.listProperty.requiredNights')}</Text>
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
          <TouchableOpacity style={styles.outlineBtn} onPress={handleSaveDraft} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>{i18n.t('host.listProperty.saveDraft')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{i18n.t('host.listProperty.submitReview')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
