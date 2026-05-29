import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import i18n from '../../locales/i18n';
import styles from './HomeScreen.styles';

interface TripItem {
  id: string;
  title: string;
  location: string;
  date: string;
  status: string;
  iconName: string;
}

interface MomentItem {
  id: string;
  author: string;
  location: string;
  likes: string;
  caption: string;
  iconName: string;
}

interface TrendingItem {
  id: string;
  placeName: string;
  stateName: string;
  rating: string;
  visits: string;
  iconName: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const userName = user?.name ?? 'Traveller';

  const handleNextStep = () => {
    navigation.navigate('PlanStep1');
  };

  const handleViewAllMoments = () => {
    Alert.alert(
      i18n.t('home.viewAll'),
      'Trip Moments gallery: Loading additional entries...'
    );
  };

  // Curated premium high-fidelity datasets using MaterialCommunityIcons
  const myTripsData: TripItem[] = [
    { id: '1', title: 'Summer Escape', location: 'Manali, Himachal Pradesh', date: 'May 12 - 18, 2026', status: 'Completed', iconName: 'mountain' },
    { id: '2', title: 'Beachside Retreat', location: 'Palolem, Goa', date: 'April 02 - 08, 2026', status: 'Completed', iconName: 'palm-tree' },
    { id: '3', title: 'Royal Heritage', location: 'Jaipur, Rajasthan', date: 'Feb 14 - 19, 2026', status: 'Completed', iconName: 'castle' },
    { id: '4', title: 'Lake Paradise', location: 'Nainital, Uttarakhand', date: 'Jan 05 - 10, 2026', status: 'Completed', iconName: 'rowing' },
    { id: '5', title: 'Wilderness Safaris', location: 'Wayanad, Kerala', date: 'Nov 12 - 17, 2025', status: 'Completed', iconName: 'elephant' },
  ];

  const tripMomentsData: MomentItem[] = [
    { id: '1', author: 'Vikram Singh', location: 'Old Manali, HP', likes: '1.4k', caption: 'Chasing the crisp morning fog.', iconName: 'coffee' },
    { id: '2', author: 'Ananya Roy', location: 'Munroe Island, KL', likes: '920', caption: 'Backwater serenity at sunrise.', iconName: 'rowing' },
    { id: '3', author: 'Rahul Mehta', location: 'Palolem, GA', likes: '1.8k', caption: 'Golden hours, warm sands.', iconName: 'weather-sunset' },
    { id: '4', author: 'Meera Sen', location: 'Amer Fort, RJ', likes: '750', caption: 'Echoes of standard heritage.', iconName: 'camera' },
    { id: '5', author: 'Siddharth', location: 'Pangong Lake, LA', likes: '2.5k', caption: 'Nature mirroring standard blue sky.', iconName: 'mountain' },
  ];

  const trendingData: TrendingItem[] = [
    { id: '1', placeName: 'Varkala Cliff', stateName: 'Kerala', rating: '4.9', visits: '18k visits', iconName: 'waves' },
    { id: '2', placeName: 'Gokarna Surf', stateName: 'Karnataka', rating: '4.8', visits: '12k visits', iconName: 'surfing' },
    { id: '3', placeName: 'Rishikesh Yoga', stateName: 'Uttarakhand', rating: '4.9', visits: '24k visits', iconName: 'meditation' },
    { id: '4', placeName: 'Udaipur Lakes', stateName: 'Rajasthan', rating: '4.7', visits: '15k visits', iconName: 'sail-boat' },
    { id: '5', placeName: 'Coorg Coffee Trails', stateName: 'Karnataka', rating: '4.8', visits: '9k visits', iconName: 'coffee' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Hero Section */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greetingText}>
                {i18n.t('home.greeting', { name: userName })}
              </Text>
              <Text style={styles.appTitle}>JuxTravel</Text>
            </View>
            <TouchableOpacity 
              style={styles.avatarCircle} 
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>{userName.slice(0, 2).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* CTA Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerBadgeContainer}>
              <Text style={styles.bannerBadgeText}>
                <Feather name="star" size={12} color="#84C9BA" /> AI COMPASS
              </Text>
            </View>
            <Text style={styles.bannerTitle}>Explore standard tailored Indian escapes</Text>
            <Text style={styles.bannerSubtitle}>Curate bespoke trips with our intelligent planning agent.</Text>
            
            <TouchableOpacity style={styles.bannerBtn} onPress={handleNextStep} activeOpacity={0.8}>
              <Text style={styles.bannerBtnText}>{i18n.t('home.ctaBtn')} →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          
          {/* Section: My Trips */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('home.myTrips')}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {myTripsData.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripEmojiCircle}>
                  <MaterialCommunityIcons name={trip.iconName as unknown as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color="#1A6B5A" />
                </View>
                <Text style={styles.tripTitle} numberOfLines={1}>{trip.title}</Text>
                <Text style={styles.tripLocation} numberOfLines={1}>{trip.location}</Text>
                <View style={styles.tripDivider} />
                <View style={styles.tripFooterRow}>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                  <View style={styles.tripBadge}>
                    <Text style={styles.tripBadgeText}>{trip.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Section: Trip Moments */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('home.tripMoments')}</Text>
            <TouchableOpacity onPress={handleViewAllMoments} activeOpacity={0.6}>
              <Text style={styles.viewAllText}>{i18n.t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {tripMomentsData.map((moment) => (
              <View key={moment.id} style={styles.momentCard}>
                <View style={styles.momentImageContainer}>
                  <MaterialCommunityIcons name={moment.iconName as unknown as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color="#1A6B5A" />
                  <View style={styles.momentLikeBadge}>
                    <Text style={styles.momentLikeText}>
                      <Feather name="heart" size={10} color="#FFFFFF" /> {moment.likes}
                    </Text>
                  </View>
                </View>
                <View style={styles.momentMeta}>
                  <Text style={styles.momentAuthor}>{moment.author}</Text>
                  <Text style={styles.momentLocation}>{moment.location}</Text>
                  <Text style={styles.momentCaption} numberOfLines={2}>"{moment.caption}"</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Section: Trending This Week */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('home.trending')}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {trendingData.map((trend) => (
              <View key={trend.id} style={styles.trendingCard}>
                <View style={styles.trendingImageContainer}>
                  <MaterialCommunityIcons name={trend.iconName as unknown as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color="#1A6B5A" />
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      <Feather name="star" size={10} color="#1A1F1E" /> {trend.rating}
                    </Text>
                  </View>
                </View>
                <Text style={styles.trendingName} numberOfLines={1}>{trend.placeName}</Text>
                <Text style={styles.trendingState}>{trend.stateName}</Text>
                <Text style={styles.trendingVisits}>{trend.visits}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Bottom padding spacing for tab bar comfort */}
          <View style={styles.bottomSpacer} />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
