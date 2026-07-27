import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendUrl =
    process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';
  const res = await fetch(`${backendUrl}/admin/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const rawResponse = await res.json();
  const data = rawResponse.data ?? rawResponse;
  const admins = Array.isArray(data) ? data : (data.admins ?? data);
  return NextResponse.json({ admins });
}
