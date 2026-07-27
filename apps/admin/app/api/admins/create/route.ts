import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const backendUrl =
    process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';
  const res = await fetch(`${backendUrl}/admin/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const rawResponse = await res.json();
  const data = rawResponse.data ?? rawResponse;
  return NextResponse.json(data, { status: res.status });
}
