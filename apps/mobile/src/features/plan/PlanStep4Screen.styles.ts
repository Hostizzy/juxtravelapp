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

  /* ── Budget Section Header ── */
  budgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  budgetLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  totalForAllChip: {
    backgroundColor: '#E6F2EF',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalForAllText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#1A6B5A',
    letterSpacing: 0.5,
  },

  /* ── Budget Display Card ── */
  budgetCard: {
    backgroundColor: '#E6F2EF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  budgetAmount: {
    fontFamily: 'serif',
    fontSize: 40,
    fontWeight: '800',
    color: '#1A6B5A',
    marginBottom: 20,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#6B7370',
    fontWeight: '500',
  },

  /* ── Budget Chips ── */
  budgetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  budgetChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
  },
  budgetChipSelected: {
    backgroundColor: '#1A6B5A',
    borderColor: '#1A6B5A',
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1F1E',
  },
  budgetChipTextSelected: {
    color: '#FFFFFF',
  },

  /* ── Specific Section ── */
  specificLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  specificInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    fontSize: 14,
    color: '#1A1F1E',
    textAlignVertical: 'top',
    lineHeight: 20,
    marginBottom: 32,
  },

  /* ── Get Matches Button ── */
  matchButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  matchButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiNote: {
    fontSize: 11,
    color: '#6B7370',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
    lineHeight: 16,
  },
});

export default styles;
