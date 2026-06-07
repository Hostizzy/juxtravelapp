import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F1714',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FAF8F4',
    paddingBottom: 40,
  },

  /* ── Shared Top Bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: '#0F1714',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontWeight: '600',
  },
  topBarSpacer: {
    width: 40,
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E8E2D9',
  },
  progressSegmentFilled: {
    backgroundColor: '#1A6B5A',
  },

  /* ── Content ── */
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1F1E',
    marginBottom: 28,
    lineHeight: 34,
  },

  /* ── Destination Input ── */
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1F1E',
    padding: 0,
  },

  /* ── Chips ── */
  chipsScroll: {
    paddingBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#F0EDE8',
  },
  chipSelected: {
    backgroundColor: '#1A6B5A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1F1E',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },

  /* ── Date Section ── */
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    padding: 16,
  },
  dateLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 8,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 15,
    color: '#1A1F1E',
    fontWeight: '500',
  },
  datePlaceholder: {
    color: '#A0A5A3',
  },

  /* ── Continue Button ── */
  continueButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
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
