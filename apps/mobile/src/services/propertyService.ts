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

export const updateProperty = async (
  id: string,
  updates: Partial<PropertyFormData>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      };
    }

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.tagline !== undefined) payload.tagline = updates.tagline;
    if (updates.type !== undefined) payload.type = updates.type;
    
    if (updates.address !== undefined || updates.city !== undefined || updates.state !== undefined) {
      payload.location = {
        address: updates.address,
        city: updates.city,
        state: updates.state,
      };
    }
    
    if (updates.rooms !== undefined || updates.maxGuests !== undefined || updates.comfortableGuests !== undefined) {
      payload.capacity = {
        rooms: updates.rooms,
        maxGuests: updates.maxGuests,
        comfortableGuests: updates.comfortableGuests,
      };
    }

    if (updates.pricePerNight !== undefined) payload.pricePerNight = updates.pricePerNight;
    if (updates.weekendPrice !== undefined) payload.weekendPrice = updates.weekendPrice;
    if (updates.amenities !== undefined) payload.amenities = updates.amenities;
    if (updates.activities !== undefined) payload.activities = updates.activities;
    if (updates.honestNotes !== undefined) payload.honestNotes = updates.honestNotes;
    if (updates.hostStory !== undefined) payload.hostStory = updates.hostStory;
    if (updates.photos !== undefined) payload.photos = updates.photos;
    if (updates.minimumStay !== undefined) payload.minimumStay = updates.minimumStay;
    if (updates.cancellationPolicy !== undefined) payload.cancellationPolicy = updates.cancellationPolicy;

    await apiService.patch(
      `/properties/${id}`,
      payload,
      token
    );

    return { success: true };
  } catch (error) {
    console.error('Update property error:', error);
    return { 
      success: false, 
      error: 'Update failed' 
    };
  }
};

export const uploadVerificationDoc = async (
  uri: string,
  docType: string
): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) return null;

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://10.0.2.2:3000/api/v1';

    const formData = new FormData();
    formData.append('doc', {
      uri,
      type: 'image/jpeg',
      name: `${docType}_${Date.now()}.jpg`,
    } as unknown as Blob);
    formData.append('docType', docType);

    const response = await fetch(
      `${backendUrl}/verification/upload-doc`,
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
    if (!response.ok) return null;
    return data.data.url;

  } catch (error) {
    console.error('Doc upload failed:', error);
    return null;
  }
};
