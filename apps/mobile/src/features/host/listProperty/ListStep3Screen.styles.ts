import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  // Top Bar
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
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
    color: '#6B7370',
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoSquare: {
    width: '31%',
    aspectRatio: 1.2,
    backgroundColor: '#F0EDE8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTip: {
    fontSize: 12,
    color: '#6B7370',
    marginBottom: 24,
  },
  // Reels Box
  uploadReelsBox: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadReelsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7370',
    marginTop: 8,
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
