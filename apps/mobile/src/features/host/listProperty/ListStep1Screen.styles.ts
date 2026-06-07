import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  // Shared Top Bar Styles
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
  // Cover Photo
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 16,
  },
  uploadBox: {
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTip: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#6B7370',
    marginTop: 8,
  },
  // Inputs
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: '#1A1F1E',
    fontSize: 15,
    marginBottom: 20,
  },
  multilineInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 12,
    color: '#1A1F1E',
    fontSize: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#D4704A',
    borderColor: '#D4704A',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E2D9',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chipTextUnselected: {
    color: '#1A1F1E',
    fontWeight: '600',
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
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
