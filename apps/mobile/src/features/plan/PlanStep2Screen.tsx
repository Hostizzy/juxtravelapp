import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './PlanStep2Screen.styles';

import PlanHeader from './PlanHeader';

type PlanStep2Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanStep2'>;
  route: RouteProp<RootStackParamList, 'PlanStep2'>;
};

interface GroupOption {
  key: string;
  label: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  bgColor: string;
}

const GROUP_OPTIONS: GroupOption[] = [
  { key: 'solo', label: 'Solo', desc: 'Travelling alone', icon: 'user', iconColor: '#1A6B5A', bgColor: '#E6F2EF' },
  { key: 'couple', label: 'Couple', desc: 'With your partner', icon: 'heart', iconColor: '#D4704A', bgColor: '#FDF2E9' },
  { key: 'friends', label: 'Friends', desc: 'With your friends', icon: 'users', iconColor: '#5E5ADB', bgColor: '#F2F0FD' },
  { key: 'family', label: 'Family', desc: 'With your family', icon: 'home', iconColor: '#2B5ADB', bgColor: '#EBF3FE' },
  { key: 'corporate', label: 'Corporate', desc: 'Work related travel', icon: 'briefcase', iconColor: '#1C6F5E', bgColor: '#EBF7F4' },
  { key: 'other', label: 'Other', desc: 'Other group type', icon: 'more-horizontal', iconColor: '#6B7370', bgColor: '#F0EDE8' },
];

export default function PlanStep2Screen({ navigation, route }: PlanStep2Props) {
  const { destination, checkIn, checkOut } = route.params;
  const [guests, setGuests] = useState(1);
  const [groupType, setGroupType] = useState<string | null>(null);
  const [bedrooms, setBedrooms] = useState(1);

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
    const group = groupType || 'solo';
    const dest = destination;

    if (group === 'solo') {
      return `Solo travelers in ${dest} highly rate homestays with local hosts for safety and authentic local food tips.`;
    }
    if (group === 'couple') {
      return `Couple travelers visiting ${dest} consistently prefer private villas with pools, spending 35% more time relaxing indoors.`;
    }
    if (group === 'friends') {
      return `Groups of friends in ${dest} save up to 40% per person by booking multi-bedroom private cottages instead of hotels.`;
    }
    if (group === 'family') {
      return `Families traveling to ${dest} show higher satisfaction in properties featuring fully equipped kitchens and private lawns.`;
    }
    return `Travelers visiting ${dest} typically prefer homes with at least ${bedrooms} room${bedrooms > 1 ? 's' : ''} for comfortable stays.`;
  };

  const handleMinusGuests = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const handlePlusGuests = () => {
    if (guests < 20) {
      setGuests(guests + 1);
    }
  };

  const handleMinusBedrooms = () => {
    if (bedrooms > 1) {
      setBedrooms(bedrooms - 1);
    }
  };

  const handlePlusBedrooms = () => {
    if (bedrooms < 10) {
      setBedrooms(bedrooms + 1);
    }
  };

  const handleContinue = () => {
    navigation.navigate('PlanStep3', {
      destination,
      checkIn,
      checkOut,
      guests,
      groupType: groupType || 'solo',
      bedrooms,
    });
  };

  const formattedGuests = guests.toString().padStart(2, '0');
  const formattedBedrooms = bedrooms.toString().padStart(2, '0');

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <PlanHeader
          step={2}
          imageUri={getDestinationImage(destination)}
          onBack={() => navigation.goBack()}
          focalStyle={getFocalStyle(destination)}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Who's joining your adventure?</Text>
            <Text style={styles.subtitle}>Tell us about your travel group</Text>

            {/* Guests Counter Card */}
            <View style={styles.counterCard}>
              <View style={styles.counterLeft}>
                <Text style={styles.counterLabel}>TOTAL GUESTS</Text>
                <Text style={styles.counterValue}>{formattedGuests}</Text>
                <Text style={styles.counterSubLabel}>
                  {guests === 1 ? 'Guest' : 'Guests'}
                </Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity style={styles.minusButton} onPress={handleMinusGuests} activeOpacity={0.7}>
                  <Feather name="minus" size={20} color="#1A1F1E" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.plusButton} onPress={handlePlusGuests} activeOpacity={0.7}>
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Group Type Grid */}
            <Text style={styles.label}>GROUP TYPE</Text>
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
                    <View style={[styles.groupIconCircle, { backgroundColor: option.bgColor }]}>
                      <Feather name={option.icon} size={20} color={option.iconColor} />
                    </View>
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.groupCardLabel}>{option.label}</Text>
                      <Text style={styles.groupCardDesc}>{option.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bedrooms Counter Card */}
            <Text style={styles.label}>BEDROOMS NEEDED</Text>
            <View style={styles.counterCard}>
              <View style={styles.counterLeft}>
                <Text style={styles.counterLabel}>BEDROOMS</Text>
                <Text style={styles.counterValue}>{formattedBedrooms}</Text>
                <Text style={styles.counterSubLabel}>Minimum rooms required</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity style={styles.minusButton} onPress={handleMinusBedrooms} activeOpacity={0.7}>
                  <Feather name="minus" size={20} color="#1A1F1E" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.plusButton} onPress={handlePlusBedrooms} activeOpacity={0.7}>
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

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

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
