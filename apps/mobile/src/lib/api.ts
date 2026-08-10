import * as SecureStore from 'expo-secure-store';

if (!process.env.EXPO_PUBLIC_BACKEND_URL && typeof __DEV__ !== 'undefined' && !__DEV__) {
  throw new Error('EXPO_PUBLIC_BACKEND_URL environment variable is required in production builds!');
}

export const BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  'https://juxtravelapp.onrender.com/api/v1';

// Builds headers without a token when none is stored — previously sent the
// literal string "Bearer null" to authenticated endpoints instead of omitting
// the header, which is a different (and confusing-to-debug) failure mode than
// "no Authorization header at all".
async function authHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    // 401 means the stored token is invalid/expired — clear it so subsequent
    // calls don't keep resending a dead token and callers can redirect to login.
    if (response.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
    }
    throw new Error(json.message ?? 'API Error');
  }
  return json.data ?? json;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: await authHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

// Single source of truth apiService compatibility export
export const apiService = {
  get: <T>(endpoint: string, _token?: string): Promise<T> => apiGet<T>(endpoint),
  post: <T>(endpoint: string, body: unknown, _token?: string): Promise<T> => apiPost<T>(endpoint, body),
  patch: <T>(endpoint: string, body: unknown, _token?: string): Promise<T> => apiPatch<T>(endpoint, body),
};
