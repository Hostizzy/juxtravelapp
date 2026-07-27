import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    
    if (!adminToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';
    
    const res = await fetch(`${backendUrl}/conversations/admin/all`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
