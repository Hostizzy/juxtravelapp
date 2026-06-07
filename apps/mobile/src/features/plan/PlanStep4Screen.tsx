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
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { RootStackParamList } from '../../navigation/RootNavigator';
import i18n from '../../locales/i18n';
import styles from './PlanStep4Screen.styles';

type PlanStep4Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep4'>;
  route: RouteProp<RootStackParamList, 'PlanStep4'>;
};

interface BudgetPreset {
  key: string;
  labelKey: string;
  value: number;
}

const BUDGET_PRESETS: BudgetPreset[] = [
  { key: 'under30k', labelKey: 'plan.step4.under30k', value: 25000 },
  { key: 'midRange', labelKey: 'plan.step4.midRange', value: 75000 },
  { key: 'luxury', labelKey: 'plan.step4.luxury', value: 150000 },
  { key: 'flexible', labelKey: 'plan.step4.flexible', value: 125000 },
];

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹ ${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

export default function PlanStep4Screen({ navigation, route }: PlanStep4Props) {
  const { destination, checkIn, checkOut, guests, groupType, moods } = route.params;
  const [budget, setBudget] = useState(45000);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [specificNotes, setSpecificNotes] = useState('');

  const handlePresetPress = (preset: BudgetPreset) => {
    if (selectedPreset === preset.key) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(preset.key);
      setBudget(preset.value);
    }
  };

  const handleSliderChange = (value: number) => {
    setBudget(value);
    setSelectedPreset(null);
  };

  const handleGetMatches = () => {
    Alert.alert(
      'Plan Summary',
      `Destination: ${destination}\n` +
      `Dates: ${checkIn} — ${checkOut}\n` +
      `Guests: ${guests} (${groupType})\n` +
      `Moods: ${moods.join(', ')}\n` +
      `Budget: ${formatCurrency(budget)}\n` +
      `Notes: ${specificNotes || 'None'}\n\n` +
      'AI matching engine will process your preferences. Coming in next release!',
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>STEP 4 OF 4</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{i18n.t('plan.step4.title')}</Text>

            {/* Budget Header */}
            <View style={styles.budgetHeaderRow}>
              <Text style={styles.budgetLabel}>{i18n.t('plan.step4.budgetLabel')}</Text>
              <View style={styles.totalForAllChip}>
                <Text style={styles.totalForAllText}>{i18n.t('plan.step4.totalForAll')}</Text>
              </View>
            </View>

            {/* Budget Display Card */}
            <View style={styles.budgetCard}>
              <Text style={styles.budgetAmount}>{formatCurrency(budget)}</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={5000}
                  maximumValue={250000}
                  step={5000}
                  value={budget}
                  onValueChange={handleSliderChange}
                  minimumTrackTintColor="#1A6B5A"
                  maximumTrackTintColor="#E8E2D9"
                  thumbTintColor="#1A6B5A"
                />
                <View style={styles.sliderLabelsRow}>
                  <Text style={styles.sliderLabel}>₹5K</Text>
                  <Text style={styles.sliderLabel}>₹2.5L</Text>
                </View>
              </View>
            </View>

            {/* Budget Presets */}
            <View style={styles.budgetChipsRow}>
              {BUDGET_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.key;
                return (
                  <TouchableOpacity
                    key={preset.key}
                    style={[styles.budgetChip, isSelected && styles.budgetChipSelected]}
                    onPress={() => handlePresetPress(preset)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.budgetChipText, isSelected && styles.budgetChipTextSelected]}>
                      {i18n.t(preset.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Specific Notes */}
            <Text style={styles.specificLabel}>{i18n.t('plan.step4.specificLabel')}</Text>
            <TextInput
              style={styles.specificInput}
              placeholder={i18n.t('plan.step4.specificPlaceholder')}
              placeholderTextColor="#A0A5A3"
              multiline
              value={specificNotes}
              onChangeText={setSpecificNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Get Matches Button */}
          <TouchableOpacity style={styles.matchButton} onPress={handleGetMatches} activeOpacity={0.85}>
            <Text style={styles.matchButtonText}>
              {i18n.t('plan.step4.getMatches')} <Feather name="target" size={20} color="#FFFFFF" />
            </Text>
          </TouchableOpacity>
          <Text style={styles.aiNote}>{i18n.t('plan.step4.aiNote')}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
