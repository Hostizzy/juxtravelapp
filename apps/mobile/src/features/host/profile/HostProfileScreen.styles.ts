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
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1714',
    paddingHorizontal: 24,
  },
  topBarText: {
    color: '#84C9BA',
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: '#0F1714',
  },
  // Profile Header
  profileHeader: {
    backgroundColor: '#0F1714',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B25',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4704A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4704A',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  verifiedChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  // Tabs row
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F1714',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B25',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#D4704A',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7370',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  activeTabButtonText: {
    color: '#D4704A',
  },
  // Tab Contents
  tabContent: {
    padding: 24,
  },
  // Section Label
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#84C9BA',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionAction: {
    fontSize: 12,
    color: '#D4704A',
    fontWeight: '600',
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
  },
  editText: {
    color: '#D4704A',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#1A2B25',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D5A42',
  },
  storyBox: {
    height: 160,
    backgroundColor: '#1A2B25',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  storyPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4704A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Payout Rows
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A2B25',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D5A42',
  },
  payoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  payoutSub: {
    color: '#84C9BA',
    fontSize: 12,
    marginTop: 2,
  },
  payoutVal: {
    fontSize: 14,
    color: '#6B7370',
  },
  // Properties Tab list
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    overflow: 'hidden',
    paddingBottom: 12,
    marginBottom: 16,
  },
  propertyCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyCardImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#1A2B25',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  propertyCardLocation: {
    fontSize: 11,
    color: '#6B7370',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  propertyCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A6B5A',
    paddingTop: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statusActive: {
    backgroundColor: '#E6F2EF',
  },
  statusReview: {
    backgroundColor: '#F5E6D0',
  },
  statusDraft: {
    backgroundColor: '#F0EDE8',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  statusActiveText: {
    color: '#1A6B5A',
  },
  statusReviewText: {
    color: '#D4704A',
  },
  statusDraftText: {
    color: '#6B7370',
  },
  emptyProperties: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    color: '#6B7370',
    marginTop: 4,
    textAlign: 'center',
  },
  // Reviews Tab list
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7370',
  },
  reviewText: {
    fontSize: 13,
    color: '#6B7370',
    lineHeight: 18,
  },
  // Settings Tab list
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1F1E',
  },
  signOutLabel: {
    color: '#D4704A',
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    color: '#6B7370',
    fontFamily: 'monospace',
  },
  // Mode Switcher Banner
  switchModeContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  switchBtn: {
    borderWidth: 1,
    borderColor: '#84C9BA',
    borderRadius: 100,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
  },
  switchBtnText: {
    color: '#1A6B5A',
    fontSize: 14,
    fontWeight: '700',
  },
  playIcon: {
    marginLeft: 2,
  },
  chevronRight: {
    marginLeft: 8,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
