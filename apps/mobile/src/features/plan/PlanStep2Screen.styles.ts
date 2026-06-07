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

  /* ── Guest Counter Card ── */
  guestCounterCard: {
    backgroundColor: '#E6F2EF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  guestCounterLeft: {
    flex: 1,
  },
  guestLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  guestNumber: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1F1E',
  },
  guestCounterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#1A1F1E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A6B5A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Group Type Grid ── */
  groupTypeLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  groupCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCardSelected: {
    borderWidth: 2,
    borderColor: '#1A6B5A',
    backgroundColor: '#E6F2EF',
  },
  groupIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  groupIconCircleSelected: {
    backgroundColor: '#D4E8E3',
  },
  groupCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1F1E',
  },
  groupCardLabelSelected: {
    color: '#1A6B5A',
    fontWeight: '700',
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
