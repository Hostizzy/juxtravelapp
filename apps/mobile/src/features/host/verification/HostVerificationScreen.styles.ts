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
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#FFFFFF',
    marginRight: 40, // offset back button to center title
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#FAF8F4',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#6B7370',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 16,
  },
  sectionSublabel: {
    fontSize: 14,
    color: '#6B7370',
    marginBottom: 12,
  },
  // Section 1: Ownership
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ownershipBtn: {
    flex: 0.48,
    height: 44,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  ownershipBtnSelected: {
    backgroundColor: '#D4704A',
    borderColor: '#D4704A',
  },
  ownershipBtnUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E2D9',
  },
  ownershipBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ownershipBtnTextUnselected: {
    color: '#1A1F1E',
    fontWeight: '600',
  },
  // Section 2: Category Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Section 3: Location Inputs
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: '#1A1F1E',
    fontSize: 15,
    marginBottom: 12,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#6B7370',
  },
  // Section 4: Capacity Rows
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  capacityLabelCol: {
    flex: 1,
  },
  capacityRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F1E',
  },
  capacityRowSub: {
    fontSize: 12,
    color: '#6B7370',
    marginTop: 2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4704A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnTextMinus: {
    color: '#1A1F1E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterBtnTextPlus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1F1E',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  // Section 5: Documents
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E8E2D9',
    borderRadius: 12,
    height: 120,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7370',
    marginTop: 8,
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 11,
    color: '#6B7370',
    textAlign: 'center',
  },
  // Bottom Button
  continueButton: {
    backgroundColor: '#D4704A',
    borderRadius: 100,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
