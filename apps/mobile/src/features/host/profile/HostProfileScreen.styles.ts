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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#D4704A',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7370',
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
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
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
  },
  sectionAction: {
    fontSize: 12,
    color: '#D4704A',
    fontWeight: '600',
  },
  bioText: {
    fontSize: 14,
    color: '#1A1F1E',
    lineHeight: 20,
    marginBottom: 24,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  payoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
    marginLeft: 12,
  },
  payoutVal: {
    fontSize: 14,
    color: '#6B7370',
  },
  // Properties Tab list
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  propertyCardImgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1A2B25',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  propertyDetails: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#1A1F1E',
    marginBottom: 4,
  },
  propertyMeta: {
    fontSize: 12,
    color: '#6B7370',
  },
  propertyRight: {
    alignItems: 'flex-end',
  },
  propertyBookingsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4704A',
    marginBottom: 6,
  },
  propertyStatusChip: {
    backgroundColor: '#1A6B5A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  propertyStatusText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
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
});
