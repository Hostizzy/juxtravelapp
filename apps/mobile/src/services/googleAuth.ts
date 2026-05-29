import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { 
  GoogleAuthProvider,
  signInWithCredential 
} from 'firebase/auth';
import { auth } from './firebase';
import { FIREBASE_WEB_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = 
    Google.useAuthRequest({
      clientId: FIREBASE_WEB_CLIENT_ID,
      androidClientId: FIREBASE_WEB_CLIENT_ID,
    });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = 
          GoogleAuthProvider.credential(id_token);
        const userResult = await 
          signInWithCredential(auth, credential);
        return { 
          success: true, 
          user: userResult.user 
        };
      }
      return { success: false, error: 'Cancelled' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };

  return { signInWithGoogle, request };
};
