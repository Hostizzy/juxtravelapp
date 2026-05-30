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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  bellButton: {
    padding: 4,
  },
  tabsContainer: {
    height: 48,
    flexDirection: 'row',
    backgroundColor: '#0F1714',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B25',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#D4704A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7370',
  },
  tabTextActive: {
    color: '#D4704A',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 88,
  },
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#1A1F1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A6B5A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  guestsCount: {
    fontSize: 12,
    color: '#6B7370',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Row 2: Property details
  propertyDetails: {
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#1A1F1E',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 13,
    color: '#6B7370',
  },
  // Row 3: Reference
  refBox: {
    backgroundColor: '#FAF8F4',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    marginBottom: 12,
  },
  refLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1,
    marginBottom: 2,
  },
  refValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#1A1F1E',
    fontWeight: '600',
  },
  // Row 4: Special Request
  specialRequestBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#D4704A',
    paddingLeft: 8,
    marginVertical: 4,
    marginBottom: 16,
  },
  specialRequestText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B7370',
  },
  // Row 5: Actions
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
    paddingTop: 16,
  },
  footerLeft: {
    flexDirection: 'row',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A6B5A',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 36,
    marginRight: 8,
  },
  whatsappBtnText: {
    color: '#1A6B5A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsBtn: {
    backgroundColor: '#1A6B5A',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1F1E',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4704A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
