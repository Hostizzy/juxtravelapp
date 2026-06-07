import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { apiService } from './api';

export interface PropertyFormData {
  // Step 1
  name: string;
  tagline: string;
  type: string;
  city: string;
  state: string;
  coverPhoto?: string;
  // Step 2
  address: string;
  maxGuests: number;
  rooms: number;
  comfortableGuests: number;
  pricePerNight: number;
  amenities: string[];
  honestNotes: string;
  // Step 3
  photos: string[];
  // Step 4
  activities: string[];
  hostStory: string;
  // Step 5
  minimumStay: number;
  weekendPrice: number;
  cancellationPolicy: string;
}

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

export const uploadPhoto = async (
  uri: string,
  bucket: string = 'property-photos'
): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) return null;

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://10.0.2.2:3000/api/v1';

    // Create form data
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: `photo_${Date.now()}.jpg`,
    } as unknown as Blob);

    const response = await fetch(
      `${backendUrl}/properties/upload-photo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Upload error:', data);
      return null;
    }

    console.log('Upload success:', data.data.url);
    return data.data.url;
    
  } catch (error) {
    console.error('Photo upload failed:', error);
    return null;
  }
};

export const submitProperty = async (
  formData: PropertyFormData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      };
    }

    await apiService.post(
      '/properties',
      {
        name: formData.name,
        tagline: formData.tagline,
        type: formData.type,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
        capacity: {
          rooms: formData.rooms,
          maxGuests: formData.maxGuests,
          comfortableGuests: formData.comfortableGuests,
        },
        pricePerNight: formData.pricePerNight,
        weekendPrice: formData.weekendPrice,
        amenities: formData.amenities,
        activities: formData.activities,
        honestNotes: formData.honestNotes,
        hostStory: formData.hostStory,
        photos: formData.photos,
        minimumStay: formData.minimumStay,
        cancellationPolicy: formData.cancellationPolicy,
        status: 'under_review',
      },
      token
    );

    return { success: true };
  } catch (error) {
    console.error('Submit property error:', error);
    return { 
      success: false, 
      error: 'Failed to submit property' 
    };
  }
};
