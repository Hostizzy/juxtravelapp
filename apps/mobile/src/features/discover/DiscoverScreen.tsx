import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  ListRenderItem,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GuestTabParamList } from '../../navigation/GuestNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';
import i18n from '../../locales/i18n';
import styles from './DiscoverScreen.styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type DiscoverScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<GuestTabParamList, 'Discover'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = 'reels' | 'stories';
type FilterType = 'all' | 'goa' | 'rajasthan' | 'kerala' | 'ladakh';

interface ReelItem {
  id: string;
  iconName: string;
  title: string;
  location: string;
  tags: string[];
  price: string;
  score: string;
  saves: string;
  shares: string;
}

interface FilterItem {
  key: FilterType;
  label: string;
}

interface StoryItem {
  id: string;
  iconName: string;
  title: string;
  body: string;
}

interface MomentItem {
  id: string;
  iconName: string;
}

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('reels');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const reelsData: ReelItem[] = [
    {
      id: '1',
      iconName: 'home',
      title: i18n.t('discover.data.reels.reel1Title'),
      location: i18n.t('discover.data.reels.reel1Loc'),
      tags: [i18n.t('discover.data.reels.reel1Tag1'), i18n.t('discover.data.reels.reel1Tag2')],
      price: '₹28,500',
      score: '9.2',
      saves: '124',
      shares: '48',
    },
  ];

  const filters: FilterItem[] = [
    { key: 'all', label: i18n.t('discover.filters.all') },
    { key: 'goa', label: i18n.t('discover.filters.goa') },
    { key: 'rajasthan', label: i18n.t('discover.filters.rajasthan') },
    { key: 'kerala', label: i18n.t('discover.filters.kerala') },
    { key: 'ladakh', label: i18n.t('discover.filters.ladakh') },
  ];

  const storiesData: StoryItem[] = [
    {
      id: '1',
      iconName: 'leaf',
      title: i18n.t('discover.data.stories.story1Title'),
      body: i18n.t('discover.data.stories.story1Body'),
    },
    {
      id: '2',
      iconName: 'weather-sunset',
      title: i18n.t('discover.data.stories.story2Title'),
      body: i18n.t('discover.data.stories.story2Body'),
    },
  ];

  const momentsData: MomentItem[] = [
    { id: '1', iconName: 'camera' },
    { id: '2', iconName: 'campfire' },
    { id: '3', iconName: 'rowing' },
    { id: '4', iconName: 'coffee' },
    { id: '5', iconName: 'mountain' },
  ];

  const handleActionPress = (action: 'save' | 'share', propertyName: string) => {
    if (action === 'save') {
      Alert.alert(propertyName, i18n.t('discover.data.reels.reelSavedAlert'));
    } else {
      Alert.alert(propertyName, i18n.t('discover.data.reels.reelSharedAlert'));
    }
  };

  const handleViewProperty = (propertyName: string) => {
    Alert.alert(i18n.t('discover.viewProperty'), `${propertyName} details page coming soon!`);
  };

  const handleReadStory = (storyTitle: string) => {
    Alert.alert(storyTitle, i18n.t('discover.data.stories.storyAlert'));
  };

  const handleSearch = () => {
    Alert.alert('Search', 'Property search logic loading...');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'No new notifications.');
  };

  const renderReelItem: ListRenderItem<ReelItem> = ({ item }) => (
    <View style={styles.reelCard}>
      {/* Property Image Placeholder - House icon center mein */}
      <View style={styles.propertyImageArea}>
        <MaterialCommunityIcons name="home" size={80} color="#84C9BA" />
      </View>

      {/* Right Side Vertical Action Panel */}
      <View style={styles.rightActionsContainer}>
        {/* bookmark icon + count */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActionPress('save', item.title)}
          activeOpacity={0.7}
        >
          <Feather name="bookmark" size={24} color="#FFFFFF" style={styles.actionIcon} />
          <Text style={styles.actionCount}>{item.saves}</Text>
        </TouchableOpacity>

        {/* share icon + count */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActionPress('share', item.title)}
          activeOpacity={0.7}
        >
          <Feather name="share-2" size={24} color="#FFFFFF" style={styles.actionIcon} />
          <Text style={styles.actionCount}>{item.shares}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom details section */}
      <View style={styles.bottomOverlay}>
        {/* ROW 1: Property name + Trust Score */}
        <View style={styles.overlayHeaderRow}>
          <Text style={[styles.propertyName, { flex: 1, marginRight: 12 }]}>{item.title}</Text>
          {/* Trust Score Badge */}
          <View style={styles.trustBadge}>
            <Text style={styles.trustScoreValue}>{item.score}</Text>
            <Text style={styles.trustScoreLabel}>{i18n.t('discover.trustScore')}</Text>
          </View>
        </View>

        {/* ROW 2: Location */}
        <Text style={styles.locationRow}>
          <Feather name="map-pin" size={12} color="#84C9BA" /> {item.location}
        </Text>

        {/* ROW 3: Amenity chips */}
        <View style={styles.chipsRow}>
          {item.tags.map((tag, idx) => (
            <View key={idx} style={styles.amenityChip}>
              <Text style={styles.amenityChipText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* ROW 4: Price */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{i18n.t('discover.startingFrom')}</Text>
          <Text style={styles.priceValue}>{item.price}/night</Text>
        </View>

        {/* ROW 5: View Property button right after price */}
        <TouchableOpacity
          style={styles.viewPropertyButton}
          onPress={() => handleViewProperty(item.title)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewPropertyButtonText}>
            View Property →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, activeTab === 'stories' && styles.lightContainer]}>
      {activeTab === 'reels' ? (
        <SafeAreaView edges={['top']} style={{flex:1, backgroundColor:'#0F1714'}}>
          {/* Top Bar - same as stories */}
          <View style={styles.topBarDark}>
            <TouchableOpacity style={styles.topBarLeft} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.topBarTitleWhite}>JuxTravel</Text>
            <View style={styles.topBarRightTextContainer}>
              <Text style={styles.usernameText}>{i18n.t('discover.data.username')}</Text>
            </View>
          </View>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]} onPress={() => setActiveTab('reels')} activeOpacity={0.7}>
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>{i18n.t('discover.reels')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('stories')} activeOpacity={0.7}>
              <Text style={styles.tabButtonText}>{i18n.t('discover.stories')}</Text>
            </TouchableOpacity>
          </View>
          {/* Reel list */}
          <FlatList
            style={{flex:1}}
            data={reelsData}
            renderItem={renderReelItem}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
          />
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Top Bar Navigation (Stories) */}
          <View style={styles.topBarLight}>
            <TouchableOpacity
              style={styles.topBarLeft}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrowDark}>←</Text>
            </TouchableOpacity>
            <Text style={styles.topBarTitleDark}>{i18n.t('auth.login.title')}</Text>
            <View style={styles.topBarRightIconsContainer}>
              <TouchableOpacity onPress={handleSearch} activeOpacity={0.7}>
                <Feather name="search" size={22} color="#1A1F1E" style={styles.topBarIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNotifications} activeOpacity={0.7}>
                <Feather name="bell" size={22} color="#1A1F1E" style={styles.topBarIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs Selector (Stories) */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setActiveTab('reels')}
              activeOpacity={0.7}
            >
              <Text style={styles.tabButtonText}>
                {i18n.t('discover.reels')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, styles.activeTabButton]}
              onPress={() => setActiveTab('stories')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>
                {i18n.t('discover.stories')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Discover Layout (Stories) */}
          <View style={styles.storiesContainer}>
            <ScrollView
              contentContainerStyle={styles.storiesScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Filter Chips Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter.key && styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedFilter(filter.key)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === filter.key && styles.filterChipTextSelected,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* TRIP STORIES section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{i18n.t('discover.tripStories')}</Text>
                <TouchableOpacity activeOpacity={0.6}>
                  <Text style={styles.sectionLink}>{i18n.t('discover.viewAll')}</Text>
                </TouchableOpacity>
              </View>

              {/* Stories Cards List */}
              {storiesData.map((story, index) => (
                <View key={story.id} style={styles.storyCard}>
                  <View
                    style={[
                      styles.storyImage,
                      index === 0 ? styles.storyBgGreen : styles.storyBgOrange,
                    ]}
                  >
                    <MaterialCommunityIcons name={story.iconName as unknown as keyof typeof MaterialCommunityIcons.glyphMap} size={50} color="#FFFFFF" />
                  </View>
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle}>
                      {story.title}
                    </Text>
                    <Text style={styles.storyBody}>{story.body}</Text>
                    <TouchableOpacity onPress={() => handleReadStory(story.title)} activeOpacity={0.6}>
                      <Text style={styles.readStoryButtonText}>
                        {i18n.t('discover.readStory')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* MOMENTS section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{i18n.t('discover.moments')}</Text>
              </View>

              {/* Moments Horizontal Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.momentsScrollContent}
              >
                {momentsData.map((moment, idx) => (
                  <View
                    key={moment.id}
                    style={[
                      styles.momentSquare,
                      idx % 2 === 0 ? styles.momentBgEven : styles.momentBgOdd,
                    ]}
                  >
                    <MaterialCommunityIcons name={moment.iconName as unknown as keyof typeof MaterialCommunityIcons.glyphMap} size={30} color="#1A6B5A" />
                  </View>
                ))}
              </ScrollView>
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
