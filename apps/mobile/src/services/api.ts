const BASE_URL = 
  process.env.BACKEND_URL ?? 
  'http://localhost:3000/api/v1';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
}

type ApiResponse<T> = 
  ApiSuccessResponse<T> | ApiErrorResponse;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = 
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    { ...options, headers },
  );

  const json = await response.json() as 
    ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.message);
  }

  return json.data;
}

export const apiService = {
  post: <T>(
    endpoint: string,
    body: unknown,
    token?: string,
  ) =>
    request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      token,
    ),

  get: <T>(
    endpoint: string,
    token: string,
  ) =>
    request<T>(
      endpoint,
      { method: 'GET' },
      token,
    ),

  patch: <T>(
    endpoint: string,
    body: unknown,
    token: string,
  ) =>
    request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      token,
    ),
};
