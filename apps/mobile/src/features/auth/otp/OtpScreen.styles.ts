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
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#0F1714',
    height: 200,
  },
  headerImage: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerOverlay: {
    backgroundColor: 'rgba(15, 23, 20, 0.45)',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 50,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 30,
    fontWeight: '800',
    color: '#84C9BA',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.85,
    lineHeight: 20,
  },
  contentArea: {
    paddingHorizontal: 24,
    backgroundColor: '#FAF8F4',
    flex: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    width: '100%',
  },
  otpInput: {
    width: 44,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1F1E',
  },
  otpInputActive: {
    borderWidth: 2,
    borderColor: '#1A6B5A',
    backgroundColor: '#E6F2EF',
  },
  verifyButton: {
    backgroundColor: '#0E5E4E',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendSection: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  resendQuestion: {
    fontSize: 13,
    color: '#6B7370',
    marginBottom: 4,
  },
  resendAction: {
    color: '#1A6B5A',
    fontWeight: '600',
    fontSize: 14,
    padding: 4,
  },
  resendTimer: {
    color: '#6B7370',
    fontSize: 13,
    marginTop: 4,
  },
});

export default styles;
