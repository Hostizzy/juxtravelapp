import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './PlanStep4Screen.styles';

import PlanHeader from './PlanHeader';

type PlanStep4Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep4'>;
  route: RouteProp<RootStackParamList, 'PlanStep4'>;
};

interface BudgetPreset {
  key: string;
  label: string;
  value: number;
}

const BUDGET_PRESETS: BudgetPreset[] = [
  { key: 'under30k', label: '💼 Under 30k', value: 25000 },
  { key: 'midRange', label: '📊 Mid-range', value: 75000 },
  { key: 'luxury', label: '👑 Luxury', value: 150000 },
  { key: 'flexible', label: '⚡ Flexible', value: 120000 },
];

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹ ${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

export default function PlanStep4Screen({ navigation, route }: PlanStep4Props) {
  const { destination, checkIn, checkOut, guests, groupType, moods, bedrooms } = route.params;
  const [budget, setBudget] = useState(45000);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [specificNotes, setSpecificNotes] = useState('');

  const getDestinationImage = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('goa')) {
      return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800';
    }
    if (d.includes('manali')) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
    }
    if (d.includes('kerala')) {
      return 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800';
    }
    if (d.includes('rajasthan') || d.includes('jaipur')) {
      return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800';
    }
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800';
  };

  const getFocalStyle = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('goa')) {
      return { top: -20 };
    }
    if (d.includes('manali')) {
      return { top: 0 };
    }
    if (d.includes('kerala')) {
      return { top: -40 };
    }
    return { top: 0 };
  };

  const getAIInsightText = () => {
    const dest = destination;
    const amount = budget;
    if (amount < 35000) {
      return `A budget of ${formatCurrency(amount)} in ${dest} is ideal for cozy private rooms and homestays offering home-cooked meals.`;
    }
    if (amount < 90000) {
      return `A mid-range budget of ${formatCurrency(amount)} in ${dest} opens premium apartments, cottages, and properties with private balconies.`;
    }
    return `A luxury budget of ${formatCurrency(amount)} in ${dest} allows booking signature estate properties, private villas with infinity pools, and personal chef services.`;
  };

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
    navigation.navigate('MatchResults', {
      destination,
      checkIn,
      checkOut,
      guests,
      groupType,
      moods,
      budget,
      freeText: specificNotes,
      bedrooms,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <PlanHeader
          step={4}
          imageUri={getDestinationImage(destination)}
          onBack={() => navigation.goBack()}
          focalStyle={getFocalStyle(destination)}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Title & Subtitle */}
            <Text style={styles.title}>Let's plan around your budget</Text>
            <Text style={styles.subtitle}>Set your budget and tell us about any special needs.</Text>

            {/* Budget Header */}
            <View style={styles.budgetHeaderRow}>
              <Text style={styles.budgetLabel}>YOUR BUDGET</Text>
              <View style={styles.totalForAllChip}>
                <Feather name="users" size={10} color="#1A6B5A" />
                <Text style={styles.totalForAllText}>TOTAL FOR ALL</Text>
              </View>
            </View>

            {/* Budget Display Card */}
            <View style={styles.budgetCard}>
              <Text style={styles.budgetAmount}>{formatCurrency(budget)}</Text>
              <Text style={styles.budgetSubtitleText}>Total trip budget</Text>
              
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
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Specific Notes */}
            <View style={styles.specificLabelContainer}>
              <Feather name="star" size={12} color="#1A6B5A" />
              <Text style={styles.specificLabel}>ANYTHING SPECIFIC?</Text>
            </View>
            <TextInput
              style={styles.specificInput}
              placeholder="e.g. Vegetarian meals only, prefer balcony rooms, anniversary surprise..."
              placeholderTextColor="#A0A5A3"
              multiline
              value={specificNotes}
              onChangeText={setSpecificNotes}
              textAlignVertical="top"
            />

            {/* AI Insight Chip */}
            <View style={styles.aiInsightCard}>
              <View style={styles.aiInsightIconCircle}>
                <Feather name="info" size={16} color="#1A6B5A" />
              </View>
              <View style={styles.aiInsightContent}>
                <Text style={styles.aiInsightTitle}>✨ AI Insight</Text>
                <Text style={styles.aiInsightDesc}>
                  {getAIInsightText()}
                </Text>
              </View>
            </View>
          </View>

          {/* Get Matches Button */}
          <TouchableOpacity style={styles.matchButton} onPress={handleGetMatches} activeOpacity={0.85}>
            <Text style={styles.matchButtonText}>Get My Matches 🎯</Text>
          </TouchableOpacity>
          
          <View style={styles.aiNoteContainer}>
            <Feather name="check-circle" size={14} color="#1A6B5A" />
            <Text style={styles.aiNote}>
              Secure planning. 100% personalized for you.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
