import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { apiService, BASE_URL } from '../lib/api';

export interface PropertyFormData {
  // Step 1
  name: string;
  tagline: string;
  type: string;
  city: string;
  state: string;
  pincode?: string;
  coverPhoto?: string;
  // Step 2
  address: string;
  maxGuests: number;
  rooms: number;
  comfortableGuests: number;
  bathrooms?: number;
  beds?: number;
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
  bucket: string = 'property-photos',
  maxRetries: number = 3
): Promise<string | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return null;

      // Create form data
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      } as unknown as Blob);

      const response = await fetch(
        `${BASE_URL}/properties/upload-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (attempt === maxRetries) {
          console.error(`❌ Upload FAILED after ${maxRetries} attempts:`, data);
          return null;
        }
        console.warn(`⚠️ Upload attempt ${attempt}/${maxRetries} failed, retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }

      console.log(
        `✅ Upload succeeded${attempt > 1 ? ` (on attempt ${attempt}/${maxRetries})` : ''}:`,
        data.data.url
      );
      return data.data.url;

    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`❌ Upload FAILED after ${maxRetries} attempts (network error):`, error);
        return null;
      }
      console.warn(`⚠️ Upload attempt ${attempt}/${maxRetries} hit a network blip, retrying in ${attempt}s...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
};

export const submitProperty = async (
  formData: PropertyFormData
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      };
    }

    const result = await apiService.post<{ id: string }>(
      '/properties',
      {
        name: formData.name,
        tagline: formData.tagline,
        type: formData.type,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        capacity: {
          rooms: formData.rooms,
          maxGuests: formData.maxGuests,
          comfortableGuests: formData.comfortableGuests,
          bathrooms: formData.bathrooms,
          beds: formData.beds,
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

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Submit property error:', error);
    return { 
      success: false, 
      error: (error as Error).message || 'Failed to submit property'
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

    const formData = new FormData();
    formData.append('doc', {
      uri,
      type: 'image/jpeg',
      name: `${docType}_${Date.now()}.jpg`,
    } as unknown as Blob);
    formData.append('docType', docType);

    const response = await fetch(
      `${BASE_URL}/verification/upload-doc`,
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
