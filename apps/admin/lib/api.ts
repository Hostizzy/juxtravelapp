const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000/api/v1';

export async function fetchFromBackend(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(
    `${BACKEND}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );
  
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }
  
  return res.json();
}
