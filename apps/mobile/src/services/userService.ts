import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

interface UserData {
  uid: string;
  name: string;
  phoneNumber: string;
  role: 'guest';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const saveUserToFirestore = async (
  userData: UserData
): Promise<{ success: boolean; error?: unknown }> => {
  try {
    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // New user — create document
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        guestProfile: {
          savedProperties: [],
          tripBriefs: []
        }
      });
    } else {
      // Existing user — update name only
      await setDoc(userRef, {
        name: userData.name,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getUserFromFirestore = async (
  uid: string
): Promise<{ success: boolean; data?: UserData; error?: unknown }> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { 
        success: true, 
        data: userSnap.data() as UserData 
      };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error };
  }
};
