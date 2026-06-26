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
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
  },
  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
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
  // Timeline Scheduler
  timelineContainer: {
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timeCol: {
    width: 80,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#D4704A',
  },
  timelineLineCol: {
    alignItems: 'center',
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4704A',
    marginTop: 4,
  },
  timelineVerticalLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#E8E2D9',
    marginTop: 4,
  },
  descCol: {
    flex: 1,
  },
  descText: {
    fontSize: 14,
    color: '#1A1F1E',
    lineHeight: 20,
  },
  addTimeSlotBtn: {
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E8E2D9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTimeSlotText: {
    fontSize: 13,
    color: '#6B7370',
    fontWeight: '600',
  },
  // AI Story
  aiStoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  aiLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginRight: 6,
  },
  storyTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  storyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7370',
    lineHeight: 22,
  },
  updateStoryBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4704A',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  updateStoryText: {
    color: '#D4704A',
    fontSize: 11,
    fontWeight: '700',
  },
  // Bottom Buttons Row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineBtn: {
    flex: 0.35,
    height: 52,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#1A1F1E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 0.6,
    height: 52,
    backgroundColor: '#D4704A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
