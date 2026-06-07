import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  // Top Bar
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#0F1714',
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  stepIndicator: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  percentText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#D4704A',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8E2D9',
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#D4704A',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#FAF8F4',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#1A1F1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7370',
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
  },
  maxPhotosInfo: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#6B7370',
  },
  // Photos Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoSquare: {
    width: (screenWidth - 48 - 16) / 3,
    aspectRatio: 1.0,
    backgroundColor: '#F0EDE8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    zIndex: 10,
  },
  gridTip: {
    fontSize: 12,
    color: '#6B7370',
    marginBottom: 24,
  },
  // Reels Grid
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  reelSquare: {
    width: (screenWidth - 48 - 12) / 2,
    height: 120,
    backgroundColor: '#F0EDE8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Instagram Sync Card
  instaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4704A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  instaIconCol: {
    marginRight: 12,
    marginTop: 2,
  },
  instaContentCol: {
    flex: 1,
  },
  instaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 4,
  },
  instaBody: {
    fontSize: 12,
    color: '#6B7370',
    lineHeight: 18,
    marginBottom: 12,
  },
  instaBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4704A',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  instaBtnText: {
    color: '#D4704A',
    fontSize: 11,
    fontWeight: '700',
  },
  // Info banner
  infoBanner: {
    backgroundColor: '#E6F2EF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1A6B5A',
    lineHeight: 18,
    fontWeight: '600',
  },
  // Button
  continueButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
