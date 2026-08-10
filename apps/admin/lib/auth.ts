import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET!;

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Not currently called — /api/auth/login gets its token straight from the backend
// (apps/backend admin.service.ts, 7d expiry) and mirrors it into the admin_token
// cookie (7d maxAge). Kept for parity in case this route is used directly; expiry
// aligned to 7d so it doesn't mislead if it's ever wired up.
export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: '7d'
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
