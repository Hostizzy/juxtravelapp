import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const headerHeight = 220; // Target height 220px

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4', // Match the page content background
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FAF8F4',
    paddingBottom: 40,
    borderTopLeftRadius: 32, // Airbnb curved edge
    borderTopRightRadius: 32, // Symmetry
    marginTop: -12, // Subtle 12px content overlap (Home Screen pattern)
    overflow: 'hidden',
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  headerBackground: {
    backgroundColor: '#0F1714',
    height: headerHeight,
    position: 'relative',
    borderBottomLeftRadius: 32, // Rounded bottom left (Home Screen pattern)
    borderBottomRightRadius: 32, // Rounded bottom right (Home Screen pattern)
    overflow: 'hidden',
  },
  topRightImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%', // Cover full width for seamless gradient fade
    height: '100%',
    zIndex: 10,
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    width: '75%', // Cover 75% of screen width on the right
    height: '100%',
    opacity: 0.85,
  },
  headerBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 15,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 48, // Immersive status bar offset (Home Screen pattern)
    paddingHorizontal: 24,
    zIndex: 20,
  },
  backButtonRow: {
    flexDirection: 'row',
    marginBottom: 24, // Consistent spacing
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#FFFFFF', // Step label to white
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 16, // Consistent spacing
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    width: '60%',
  },
  progressSegment: {
    flex: 1,
    height: 6, // 6px progress bar
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressSegmentFilled: {
    backgroundColor: '#1A6B5A',
    // Subtle Linear.app style shadow glow (not gaming app neon)
    shadowColor: '#1A6B5A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20, // Tightened title spacing
  },
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1F1E',
    marginBottom: 32,
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1F1E',
    padding: 0,
  },
  chipsScrollView: {
    marginHorizontal: -24,
  },
  chipsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#F0EDE8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipSelected: {
    backgroundColor: '#1A6B5A',
    shadowColor: '#1A6B5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1F1E',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  arrowChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 16,
    color: '#1A1F1E',
    fontWeight: '600',
  },
  dateValueContainer: {
    marginTop: 4,
  },
  dateDayMonth: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1F1E',
  },
  dateWeekday: {
    fontSize: 12,
    color: '#6B7370',
    fontWeight: '600',
    marginTop: 2,
  },
  datePlaceholder: {
    color: '#A0A5A3',
    fontWeight: '500',
  },
  dateArrow: {
    fontSize: 16,
    color: '#6B7370',
  },
  flexibleToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  flexibleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sparkleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexibleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  flexibleSubtitle: {
    fontSize: 11,
    color: '#6B7370',
    marginTop: 2,
  },
  aiInsightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF3FE',
    borderWidth: 1,
    borderColor: '#D4E8E3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  aiInsightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4E8E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiInsightContent: {
    flex: 1,
  },
  aiInsightTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: '#1A6B5A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aiInsightDesc: {
    fontSize: 12,
    color: '#6B7370',
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
