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
    marginBottom: 6,
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7370',
    marginBottom: 24,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  counterCard: {
    backgroundColor: '#F0F9F7',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  counterLeft: {
    flex: 1,
  },
  counterLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#1A6B5A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  counterValue: {
    fontFamily: 'serif',
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1F1E',
  },
  counterSubLabel: {
    fontSize: 12,
    color: '#6B7370',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  minusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A6B5A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A6B5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  groupCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCardSelected: {
    borderWidth: 2,
    borderColor: '#1A6B5A',
    shadowColor: '#1A6B5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A6B5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1F1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  groupCardDesc: {
    fontSize: 11,
    color: '#6B7370',
    textAlign: 'center',
    lineHeight: 15,
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
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
