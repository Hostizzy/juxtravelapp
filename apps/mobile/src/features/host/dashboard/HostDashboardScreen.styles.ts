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
    justifyContent: 'space-between',
    backgroundColor: '#0F1714',
    paddingHorizontal: 24,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#84C9BA',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Stats
  statsSection: {
    backgroundColor: '#0F1714',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  statsScroll: {
    marginTop: 8,
  },
  statCard: {
    backgroundColor: '#1A3D2E',
    borderWidth: 1,
    borderColor: '#2D5A42',
    borderRadius: 12,
    padding: 16,
    width: 110,
    marginRight: 12,
    justifyContent: 'center',
  },
  statsCard: {
    backgroundColor: '#1A3D2E',
    borderWidth: 1,
    borderColor: '#2D5A42',
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  statsValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  statLabel: {
    color: '#84C9BA',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
  statsLabel: {
    color: '#84C9BA',
    fontSize: 10,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4704A',
  },
  // Properties Scroll
  propertiesScroll: {
    paddingLeft: 24,
  },
  propertyCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    marginRight: 12,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  propertyImagePlaceholder: {
    height: 100,
    backgroundColor: '#1A2B25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#1A1F1E',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  propertyBooked: {
    fontSize: 12,
    color: '#D4704A',
    fontWeight: '600',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  statusChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Booking Rows
  bookingsList: {
    paddingHorizontal: 24,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  bookingSub: {
    fontSize: 12,
    color: '#6B7370',
    marginTop: 2,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 4,
  },
  rowStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  rowStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  // Checkins side-by-side
  checkinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  checkinCard: {
    flex: 0.48,
    backgroundColor: '#1E2B25',
    borderRadius: 12,
    padding: 16,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkinTime: {
    color: '#D4704A',
    fontSize: 12,
    fontWeight: '700',
  },
  checkinTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
});
