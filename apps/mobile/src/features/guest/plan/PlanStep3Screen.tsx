import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import styles from './PlanStep3Screen.styles';

import PlanHeader from './PlanHeader';
import { AIInsightCard } from './AIInsightCard';

type PlanStep3Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep3'>;
  route: RouteProp<RootStackParamList, 'PlanStep3'>;
};

interface MoodOption {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
  tags: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'peaceful', icon: 'wind', title: 'Peaceful', desc: 'Slow living, meditation, and quiet nature.', tags: '🌿 Nature • 🧘‍♀️ Yoga • 🤫 Quiet' },
  { key: 'adventure', icon: 'compass', title: 'Adventure', desc: 'Hiking, wildlife, and off-beat trails.', tags: '🏔 Mountains • 🥾 Trekking • 🦌 Wildlife' },
  { key: 'cultural', icon: 'book-open', title: 'Cultural', desc: 'Heritage sites, history, and local arts.', tags: '🏰 Forts • 🎨 Art • 📜 History' },
  { key: 'culinary', icon: 'coffee', title: 'Culinary', desc: 'Street food tours and gourmet kitchens.', tags: '🍛 Curries • ☕ Coffee • 🥘 Street Food' },
  { key: 'luxury', icon: 'star', title: 'Luxury', desc: 'High-end stays and exclusive access.', tags: '⭐️ 5-Star • 🏊‍♂️ Pool • 🍸 Lounge' },
  { key: 'social', icon: 'users', title: 'Social', desc: 'Nightlife, festivals, and group events.', tags: '🎉 Clubs • 🎵 Music • 🍻 Meets' },
  { key: 'romantic', icon: 'heart', title: 'Romantic', desc: 'Couple getaways and special moments.', tags: '❤️ Sunset • 🍾 Dinner • 🌹 Flowers' },
  { key: 'localLife', icon: 'home', title: 'City Life', desc: 'Urban experiences and vibrant city vibes.', tags: '🛍 Shopping • 🚇 Metro • 🌃 Skyline' },
];

export default function PlanStep3Screen({ navigation, route }: PlanStep3Props) {
  const { destination, checkIn, checkOut, guests, groupType, bedrooms } = route.params;
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

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
    if (selectedMoods.length === 0) {
      return `Experience matches score 40% higher in guest feedback reviews. Choose some vibes to see contextual tips.`;
    }
    const vibesList = selectedMoods.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
    return `Properties matching [${vibesList}] vibes in ${dest} currently show high demand. Booking these curated options ensures private tours and personalized hosts.`;
  };

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
      bedrooms,
    });
  };

  const hasSelections = selectedMoods.length > 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <PlanHeader
          step={3}
          imageUri={getDestinationImage(destination)}
          onBack={() => navigation.goBack()}
          focalStyle={getFocalStyle(destination)}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title & Subtitle */}
            <Text style={styles.title}>What kind of experience?</Text>
            <Text style={styles.subtitle}>Choose the vibe of your trip.</Text>

            {/* Selection badge and dynamic match score */}
            <View style={styles.badgeAndMatchRow}>
              <View style={styles.counterChipRow}>
                <View style={styles.counterChip}>
                  <Feather name="star" size={12} color="#1A6B5A" />
                  <Text style={styles.counterChipText}>
                    ✦ {selectedMoods.length}/3 SELECTED
                  </Text>
                </View>
              </View>

              {hasSelections && (
                <View style={styles.aiMatchBanner}>
                  <Feather name="cpu" size={16} color="#1A6B5A" />
                  <Text style={styles.aiMatchText}>
                    ✨ AI Match Score: 92% match found. Popular among travelers visiting {destination}.
                  </Text>
                </View>
              )}
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
                    <View style={styles.cardTopRow}>
                      <View style={[styles.moodIconCircle, isSelected && styles.moodIconCircleSelected]}>
                        <Feather name={mood.icon} size={20} color={isSelected ? '#1A6B5A' : '#6B7370'} />
                      </View>
                      <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleSelected]}>
                        {isSelected && <Feather name="check" size={12} color="#FFFFFF" />}
                      </View>
                    </View>
                    <View>
                      <Text style={[styles.moodTitle, isSelected && styles.moodTitleSelected]}>
                        {mood.title}
                      </Text>
                      <Text style={styles.moodSubtitle}>{mood.desc}</Text>
                      <Text style={styles.moodTagsText}>{mood.tags}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AIInsightCard
              step={3}
              destination={destination}
              moods={selectedMoods}
              fallbackText={getAIInsightText()}
            />
          </View>

          {/* Next Step Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
