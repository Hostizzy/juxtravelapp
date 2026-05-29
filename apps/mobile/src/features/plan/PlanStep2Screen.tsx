import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import i18n from '../../locales/i18n';
import styles from './PlanStep2Screen.styles';

type PlanStep2Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep2'>;
  route: RouteProp<RootStackParamList, 'PlanStep2'>;
};

interface GroupOption {
  key: string;
  labelKey: string;
  icon: keyof typeof Feather.glyphMap;
}

const GROUP_OPTIONS: GroupOption[] = [
  { key: 'solo', labelKey: 'plan.step2.solo', icon: 'user' },
  { key: 'couple', labelKey: 'plan.step2.couple', icon: 'heart' },
  { key: 'friends', labelKey: 'plan.step2.friends', icon: 'users' },
  { key: 'family', labelKey: 'plan.step2.family', icon: 'home' },
  { key: 'corporate', labelKey: 'plan.step2.corporate', icon: 'briefcase' },
  { key: 'other', labelKey: 'plan.step2.other', icon: 'more-horizontal' },
];

export default function PlanStep2Screen({ navigation, route }: PlanStep2Props) {
  const { destination, checkIn, checkOut } = route.params;
  const [guests, setGuests] = useState(1);
  const [groupType, setGroupType] = useState<string | null>(null);

  const handleMinus = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const handlePlus = () => {
    if (guests < 20) {
      setGuests(guests + 1);
    }
  };

  const handleContinue = () => {
    navigation.navigate('PlanStep3', {
      destination,
      checkIn,
      checkOut,
      guests,
      groupType: groupType || 'solo',
    });
  };

  const formattedGuests = guests.toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#1A1F1E" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>STEP 2 OF 4</Text>
        <View style={styles.topBarSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
        <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
        <View style={styles.progressSegment} />
        <View style={styles.progressSegment} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{i18n.t('plan.step2.title')}</Text>

          {/* Guest Counter Card */}
          <View style={styles.guestCounterCard}>
            <View style={styles.guestCounterLeft}>
              <Text style={styles.guestLabel}>{i18n.t('plan.step2.guestsLabel')}</Text>
              <Text style={styles.guestNumber}>{formattedGuests}</Text>
            </View>
            <View style={styles.guestCounterButtons}>
              <TouchableOpacity style={styles.minusButton} onPress={handleMinus} activeOpacity={0.7}>
                <Feather name="minus" size={20} color="#1A1F1E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.plusButton} onPress={handlePlus} activeOpacity={0.7}>
                <Feather name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Group Type Label */}
          <Text style={styles.groupTypeLabel}>{i18n.t('plan.step2.groupTypeLabel')}</Text>

          {/* Group Type Grid */}
          <View style={styles.groupGrid}>
            {GROUP_OPTIONS.map((option) => {
              const isSelected = groupType === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.groupCard, isSelected && styles.groupCardSelected]}
                  onPress={() => setGroupType(option.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.groupIconCircle, isSelected && styles.groupIconCircleSelected]}>
                    <Feather name={option.icon} size={24} color={isSelected ? '#1A6B5A' : '#6B7370'} />
                  </View>
                  <Text style={[styles.groupCardLabel, isSelected && styles.groupCardLabelSelected]}>
                    {i18n.t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueButtonText}>{i18n.t('plan.step2.continueBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
