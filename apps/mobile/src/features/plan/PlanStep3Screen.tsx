import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/RootNavigator';
import i18n from '../../locales/i18n';
import styles from './PlanStep3Screen.styles';

type PlanStep3Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep3'>;
  route: RouteProp<RootStackParamList, 'PlanStep3'>;
};

interface MoodOption {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  titleKey: string;
  subtitleKey: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'peaceful', icon: 'wind', titleKey: 'plan.step3.peaceful', subtitleKey: 'plan.step3.peacefulSub' },
  { key: 'adventure', icon: 'compass', titleKey: 'plan.step3.adventure', subtitleKey: 'plan.step3.adventureSub' },
  { key: 'cultural', icon: 'book-open', titleKey: 'plan.step3.cultural', subtitleKey: 'plan.step3.culturalSub' },
  { key: 'culinary', icon: 'coffee', titleKey: 'plan.step3.culinary', subtitleKey: 'plan.step3.culinarySub' },
  { key: 'luxury', icon: 'star', titleKey: 'plan.step3.luxury', subtitleKey: 'plan.step3.luxurySub' },
  { key: 'social', icon: 'users', titleKey: 'plan.step3.social', subtitleKey: 'plan.step3.socialSub' },
  { key: 'romantic', icon: 'heart', titleKey: 'plan.step3.romantic', subtitleKey: 'plan.step3.romanticSub' },
  { key: 'localLife', icon: 'home', titleKey: 'plan.step3.localLife', subtitleKey: 'plan.step3.localLifeSub' },
];

export default function PlanStep3Screen({ navigation, route }: PlanStep3Props) {
  const { destination, checkIn, checkOut, guests, groupType } = route.params;
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const handleMoodToggle = (key: string) => {
    if (selectedMoods.includes(key)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== key));
    } else if (selectedMoods.length < 3) {
      setSelectedMoods([...selectedMoods, key]);
    } else {
      Alert.alert('Maximum 3', 'You can select up to 3 experiences.');
    }
  };

  const handleNextStep = () => {
    if (selectedMoods.length === 0) {
      Alert.alert('Select Experience', 'Please select at least one experience type.');
      return;
    }
    navigation.navigate('PlanStep4', {
      destination,
      checkIn,
      checkOut,
      guests,
      groupType,
      moods: selectedMoods,
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
          <Text style={styles.stepIndicator}>STEP 3 OF 4</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
          <View style={styles.progressSegment} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title & Subtitle */}
            <Text style={styles.title}>{i18n.t('plan.step3.title')}</Text>
            <Text style={styles.subtitle}>{i18n.t('plan.step3.subtitle')}</Text>

            {/* Counter Chip */}
            <View style={styles.counterChipRow}>
              <View style={styles.counterChip}>
                <Text style={styles.counterChipText}>
                  {i18n.t('plan.step3.selectedCount', { count: selectedMoods.length })}
                </Text>
              </View>
            </View>

            {/* Mood Cards Grid */}
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMoods.includes(mood.key);
                return (
                  <TouchableOpacity
                    key={mood.key}
                    style={[styles.moodCard, isSelected && styles.moodCardSelected]}
                    onPress={() => handleMoodToggle(mood.key)}
                    activeOpacity={0.7}
                  >
                    <Feather 
                      name={mood.icon} 
                      size={28} 
                      color={isSelected ? '#1A6B5A' : '#6B7370'} 
                      style={styles.moodEmoji} 
                    />
                    <Text style={[styles.moodTitle, isSelected && styles.moodTitleSelected]}>
                      {i18n.t(mood.titleKey)}
                    </Text>
                    <Text style={styles.moodSubtitle}>{i18n.t(mood.subtitleKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Next Step Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>{i18n.t('plan.step3.nextBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
