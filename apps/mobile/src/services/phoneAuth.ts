import { FIREBASE_API_KEY } from '@env';

const FIREBASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1';

export const sendOTP = async (
  phoneNumber: string
): Promise<{
  success: boolean;
  sessionInfo?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${FIREBASE_AUTH_URL}/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: '+91' + phoneNumber,
          recaptchaToken: 'test-reCAPTCHA-token',
        }),
      }
    );
    const data = await response.json();
    if (data.error) {
      return { 
        success: false, 
        error: data.error.message 
      };
    }
    return { 
      success: true, 
      sessionInfo: data.sessionInfo 
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error' 
    };
  }
};

export const verifyOTP = async (
  sessionInfo: string,
  otp: string
): Promise<{
  success: boolean;
  idToken?: string;
  user?: object;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${FIREBASE_AUTH_URL}/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionInfo,
          code: otp,
        }),
      }
    );
    const data = await response.json();
    if (data.error) {
      return { 
        success: false, 
        error: data.error.message 
      };
    }
    return { 
      success: true, 
      idToken: data.idToken,
      user: {
        phoneNumber: data.phoneNumber,
        uid: data.localId,
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error' 
    };
  }
};
