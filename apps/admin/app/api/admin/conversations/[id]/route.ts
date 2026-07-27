import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';

    const headers = { Authorization: `Bearer ${adminToken}` };

    const [detailRes, messagesRes] = await Promise.all([
      fetch(`${backendUrl}/conversations/${id}/detail`, { cache: 'no-store', headers }),
      fetch(`${backendUrl}/conversations/${id}/messages?role=admin`, { cache: 'no-store', headers }),
    ]);

    if (!detailRes.ok || !messagesRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: detailRes.status || messagesRes.status });
    }

    const convRaw = await detailRes.json();
    const messagesRaw = await messagesRes.json();

    const conv = convRaw.data ?? convRaw;
    const messages = messagesRaw.data ?? messagesRaw;

    return NextResponse.json({ conv, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
