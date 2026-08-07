import * as SecureStore from 'expo-secure-store';

if (!process.env.EXPO_PUBLIC_BACKEND_URL && typeof __DEV__ !== 'undefined' && !__DEV__) {
  throw new Error('EXPO_PUBLIC_BACKEND_URL environment variable is required in production builds!');
}

export const BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  'https://juxtravelapp.onrender.com/api/v1';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = await SecureStore.getItemAsync('access_token');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message ?? 'API Error');
  }
  return json.data ?? json;
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await SecureStore.getItemAsync('access_token');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message ?? 'API Error');
  }
  return json.data ?? json;
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await SecureStore.getItemAsync('access_token');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message ?? 'API Error');
  }
  return json.data ?? json;
}

// Single source of truth apiService compatibility export
export const apiService = {
  get: <T>(endpoint: string, _token?: string): Promise<T> => apiGet<T>(endpoint),
  post: <T>(endpoint: string, body: unknown, _token?: string): Promise<T> => apiPost<T>(endpoint, body),
  patch: <T>(endpoint: string, body: unknown, _token?: string): Promise<T> => apiPatch<T>(endpoint, body),
};
