import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { GuestTabParamList } from '../../navigation/GuestNavigator';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../locales/i18n';
import styles from './HomeScreen.styles';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<GuestTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface TripItem {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'Completed' | 'Upcoming';
  imageUrl: string;
}

interface MomentItem {
  id: string;
  author: string;
  location: string;
  imageUrl: string;
}

interface TrendingItem {
  id: string;
  placeName: string;
  stateName: string;
  rating: string;
  imageUrl: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const userName = user?.name ?? 'Lakshay';

  const handleNextStep = () => {
    navigation.navigate('PlanStep1');
  };

  const handleViewAllMoments = () => {
    Alert.alert(
      i18n.t('home.viewAll'),
      'Trip Moments gallery: Loading additional entries...'
    );
  };

  const handleViewAllTrips = () => {
    Alert.alert(
      i18n.t('home.viewAll'),
      'My Trips: Loading all past and upcoming trips...'
    );
  };

  const myTripsData: TripItem[] = [
    {
      id: '1',
      title: 'Summer Escape',
      location: 'Manali, Himachal Pradesh',
      date: 'May 12-18, 2026',
      status: 'Completed',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: '2',
      title: 'Beachside Retreat',
      location: 'Palolem, Goa',
      date: 'Apr 02-08, 2026',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    },
    {
      id: '3',
      title: 'Royal Heritage',
      location: 'Jaipur, Rajasthan',
      date: 'Feb 14-19, 2026',
      status: 'Completed',
      imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
    },
    {
      id: '4',
      title: 'Lake Paradise',
      location: 'Nainital, Uttarakhand',
      date: 'Jan 05-10, 2026',
      status: 'Completed',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: '5',
      title: 'Wilderness Safaris',
      location: 'Wayanad, Kerala',
      date: 'Nov 12-17, 2025',
      status: 'Completed',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
  ];

  const tripMomentsData: MomentItem[] = [
    {
      id: '1',
      author: 'Vikram Singh',
      location: 'Old Manali, HP',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: '2',
      author: 'Ananya Roy',
      location: 'Munroe Island, KL',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
    {
      id: '3',
      author: 'Rahul Mehta',
      location: 'Palolem, GA',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    },
    {
      id: '4',
      author: 'Meera Sen',
      location: 'Amer Fort, RJ',
      imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
    },
    {
      id: '5',
      author: 'Siddharth',
      location: 'Pangong Lake, LA',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
  ];

  const trendingData: TrendingItem[] = [
    {
      id: '1',
      placeName: 'Varkala Cliff',
      stateName: 'Kerala',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    },
    {
      id: '2',
      placeName: 'Gokarna Surf',
      stateName: 'Karnataka',
      rating: '4.8',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
    {
      id: '3',
      placeName: 'Rishikesh Yoga',
      stateName: 'Uttarakhand',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: '4',
      placeName: 'Udaipur Lakes',
      stateName: 'Rajasthan',
      rating: '4.7',
      imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    },
    {
      id: '5',
      placeName: 'Coorg Coffee Trails',
      stateName: 'Karnataka',
      rating: '4.8',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Hero Section */}
          <View style={styles.headerWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800' }} 
              style={styles.headerAbsoluteImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['#021412', 'rgba(2, 20, 18, 0.9)', 'rgba(2, 20, 18, 0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.35, 0.7, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['transparent', 'rgba(2, 20, 18, 0.25)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.headerContentContainer}>
              <View style={styles.headerTopRow}>
                <Text style={styles.greetingText}>
                  Good evening {userName}
                </Text>
                <TouchableOpacity 
                  style={styles.avatarCircle} 
                  onPress={() => navigation.navigate('Profile')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarText}>LA</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.appTitle}>Ready for your next escape?</Text>
            </View>
          </View>

          {/* Content Area */}
          <View style={styles.contentArea}>
            {/* CTA Banner Card (overlap bottom of hero) */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerBadgeContainer}>
                <Text style={styles.bannerBadgeText}>✦ AI COMPASS</Text>
              </View>
              
              <View style={styles.bannerContentRow}>
                <View style={styles.bannerTextLeft}>
                  <Text style={styles.bannerTitle}>Based on your interests:</Text>
                  <View style={styles.bannerTagsRow}>
                    <View style={styles.bannerTag}><Text style={styles.bannerTagText}>✓ Adventure</Text></View>
                    <View style={styles.bannerTag}><Text style={styles.bannerTagText}>✓ Nature</Text></View>
                    <View style={styles.bannerTag}><Text style={styles.bannerTagText}>✓ Mid-range</Text></View>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.bannerBtn} onPress={handleNextStep} activeOpacity={0.8}>
                <Text style={styles.bannerBtnText}>3 curated itineraries waiting →</Text>
              </TouchableOpacity>
            </View>
            
            {/* Section: My Trips */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{i18n.t('home.myTrips')}</Text>
              <TouchableOpacity onPress={handleViewAllTrips} activeOpacity={0.6}>
                <Text style={styles.viewAllText}>{i18n.t('home.viewAll')} &gt;</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScroll}
            >
              {myTripsData.map((trip) => (
                <View key={trip.id} style={styles.tripCard}>
                  <Image source={{ uri: trip.imageUrl }} style={styles.tripImage} />
                  <View style={styles.tripTextContainer}>
                    <View>
                      <Text style={styles.tripTitle} numberOfLines={1}>{trip.title}</Text>
                      <View style={styles.tripLocationRow}>
                        <Text style={{ fontSize: 10 }}>📍</Text>
                        <Text style={styles.tripLocation} numberOfLines={1}>
                          {trip.location.split(',')[0]}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tripFooterRow}>
                      <View style={styles.tripDateContainer}>
                        <Text style={{ fontSize: 10 }}>🗓</Text>
                        <Text style={styles.tripDate}>{trip.date}</Text>
                      </View>
                      <View 
                        style={[
                          styles.tripBadge, 
                          trip.status === 'Completed' ? styles.tripBadgeCompleted : styles.tripBadgeUpcoming
                        ]}
                      >
                        <Text 
                          style={[
                            styles.tripBadgeText,
                            trip.status === 'Completed' ? styles.tripBadgeTextCompleted : styles.tripBadgeTextUpcoming
                          ]}
                        >
                          {trip.status === 'Completed' ? 'Completed' : '✨ AI Planned'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Section: Trip Moments */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{i18n.t('home.tripMoments')}</Text>
              <TouchableOpacity onPress={handleViewAllMoments} activeOpacity={0.6}>
                <Text style={styles.viewAllText}>{i18n.t('home.viewAll')} &gt;</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScroll}
            >
              {tripMomentsData.map((moment) => (
                <View key={moment.id} style={styles.momentCard}>
                  <ImageBackground source={{ uri: moment.imageUrl }} style={styles.momentImageBg}>
                    <View style={styles.momentOverlay}>
                      <Text style={styles.momentAuthor}>{moment.author}</Text>
                      <Text style={styles.momentLocation}>{moment.location}</Text>
                    </View>
                  </ImageBackground>
                </View>
              ))}
            </ScrollView>

            {/* Section: Trending This Week */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{i18n.t('home.trending')}</Text>
              <TouchableOpacity onPress={handleViewAllMoments} activeOpacity={0.6}>
                <Text style={styles.viewAllText}>{i18n.t('home.viewAll')} &gt;</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScroll}
            >
              {trendingData.map((trend) => (
                <View key={trend.id} style={styles.trendingCard}>
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: trend.imageUrl }} style={styles.trendingImage} />
                    <View style={styles.ratingBadge}>
                      <Feather name="star" size={10} color="#1A1F1E" />
                      <Text style={styles.ratingText}>{trend.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingName} numberOfLines={1}>{trend.placeName}</Text>
                    <Text style={styles.trendingState}>{trend.stateName}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Bottom padding spacing for tab bar comfort */}
            <View style={styles.bottomSpacer} />

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
