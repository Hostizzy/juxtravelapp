import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1714', // Default is dark for Reels
  },
  lightContainer: {
    backgroundColor: '#FAF8F4', // Stories background
  },
  // Top Bar for Reels (Dark)
  topBarDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: '#0F1714',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B25',
  },
  // Top Bar for Stories (Light)
  topBarLight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE8',
  },
  topBarLeft: {
    width: 40,
    justifyContent: 'center',
  },
  topBarRightTextContainer: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  topBarRightIconsContainer: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backArrowWhite: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  backArrowDark: {
    fontSize: 24,
    color: '#1A1F1E',
  },
  topBarTitleWhite: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  topBarTitleDark: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1A1F1E',
    textAlign: 'center',
  },
  usernameText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#84C9BA',
    fontWeight: '600',
  },
  topBarIcon: {
    fontSize: 18,
    color: '#1A1F1E',
    marginLeft: 16,
  },
  // Tabs below top bar
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1714',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B25',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#1A6B5A',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7370',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  // TAB 1: REELS Styles
  reelsContainer: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  reelCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 125,
    flex: 1,
    backgroundColor: '#0F1714',
    flexDirection: 'column',
  },
  propertyImageArea: {
    flex: 1,
    backgroundColor: '#1A2B25',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  propertyEmoji: {
    fontSize: 80,
  },
  // Actions on right (vertical)
  rightActionsContainer: {
    position: 'absolute',
    right: 16,
    top: '30%',
    alignItems: 'center',
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 12,
  },
  actionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Bottom overlay info
  bottomOverlay: {
    backgroundColor: '#0F1714',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80, // (above nav bar)
  },
  overlayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overlayTextDetails: {
    flex: 1,
    marginRight: 12,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
  },
  locationRow: {
    fontSize: 12,
    color: '#84C9BA',
    fontWeight: '600',
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  amenityChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityChipText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 8,
    fontWeight: '700',
  },
  priceRow: {
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#84C9BA',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Trust score badge
  trustBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A6B5A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  trustScoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trustScoreLabel: {
    fontSize: 7,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  // Bottom buttons row
  viewPropertyButton: {
    height: 44,
    backgroundColor: '#1A6B5A',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  viewPropertyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // TAB 2: STORIES Styles
  storiesContainer: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  storiesScroll: {
    paddingBottom: 40,
  },
  // Filter Chips Scroll
  filterScroll: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  filterChip: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  filterChipSelected: {
    backgroundColor: '#1A6B5A',
    borderColor: '#1A6B5A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
  },
  sectionLink: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#1A6B5A',
    letterSpacing: 1.5,
  },
  // Story Card
  storyCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  storyImage: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImageEmoji: {
    fontSize: 50,
  },
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1A1F1E',
    marginBottom: 8,
    lineHeight: 26,
  },
  storyBody: {
    fontSize: 13,
    color: '#6B7370',
    lineHeight: 18,
    marginBottom: 14,
  },
  readStoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A6B5A',
  },
  // Moments Section
  momentsScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 24,
  },
  momentSquare: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  momentEmoji: {
    fontSize: 30,
  },
  momentBgEven: {
    backgroundColor: '#E6F2EF',
  },
  momentBgOdd: {
    backgroundColor: '#F5E6D0',
  },
  storyBgGreen: {
    backgroundColor: '#1A6B5A',
  },
  storyBgOrange: {
    backgroundColor: '#D4704A',
  },
  safeAreaReels: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  safeAreaStories: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  flatListFlex: {
    flex: 1,
  },
});

export default styles;
