import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  // Shared Header Styles
  headerWrapper: {
    height: 120,
    overflow: 'hidden',
    backgroundColor: '#0F1714',
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#E67E52',
  },
  progressBarContainer: {
    height: 4,
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#E67E52',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#FAF8F4',
  },
  title: {
    fontSize: 32,
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
  // Cover Photo
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
  },
  uploadBox: {
    height: 180,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E8E2D9',
    borderRadius: 24,
    backgroundColor: '#FAF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  uploadTip: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#6B7370',
    marginTop: 8,
  },
  // Input Containers with Icons
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    color: '#1A1F1E',
    fontSize: 15,
  },
  // Multiline Text Area with characters counter
  multilineContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    minHeight: 110,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    marginBottom: 24,
    position: 'relative',
  },
  multilineIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  multilineField: {
    flex: 1,
    color: '#1A1F1E',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    fontSize: 11,
    color: '#6B7370',
    fontFamily: 'monospace',
  },
  // Chips
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
    paddingRight: 24,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  chipButtonActive: {
    borderColor: '#1A6B5A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7370',
    marginLeft: 6,
  },
  chipTextActive: {
    color: '#1A6B5A',
    fontWeight: 'bold',
  },
  // Inputs fallbacks
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: '#1A1F1E',
    fontSize: 15,
    marginBottom: 24,
  },
  // City/State side-by-side row
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  halfInputContainer: {
    flex: 0.48,
  },
  // Button
  continueButton: {
    backgroundColor: '#E67E52', // orange button color matching screenshot 1
    borderRadius: 100,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E67E52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F2EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Dropdown Modal/Touchable Styles
  inputTouchable: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  touchableText: {
    fontSize: 15,
    color: '#1A1F1E',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#6B7370',
    fontWeight: 'normal',
  },
});
