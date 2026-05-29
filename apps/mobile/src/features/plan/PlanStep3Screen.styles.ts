import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: '#FAF8F4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#6B7370',
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
    marginBottom: 6,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7370',
    marginBottom: 16,
    lineHeight: 20,
  },

  /* ── Counter Chip ── */
  counterChipRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  counterChip: {
    backgroundColor: '#E6F2EF',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  counterChipText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: '#1A6B5A',
    letterSpacing: 0.5,
  },

  /* ── Mood Grid ── */
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  moodCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    padding: 16,
  },
  moodCardSelected: {
    borderWidth: 2,
    borderColor: '#1A6B5A',
    backgroundColor: '#E6F2EF',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 4,
  },
  moodTitleSelected: {
    color: '#1A6B5A',
  },
  moodSubtitle: {
    fontSize: 11,
    color: '#6B7370',
    lineHeight: 15,
  },

  /* ── Next Step Button ── */
  nextButton: {
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
