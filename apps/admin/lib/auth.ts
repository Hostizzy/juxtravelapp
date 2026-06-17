import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET!;

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: '24h'
  });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminUser(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  
  if (!token) return null;
  return verifyAdminToken(token);
}
