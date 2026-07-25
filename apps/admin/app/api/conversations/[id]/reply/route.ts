import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { message } = (await req.json()) as { message: string };

  const backendUrl =
    process.env.BACKEND_URL || 'https://juxtravelapp.onrender.com/api/v1';
  const res = await fetch(`${backendUrl}/conversations/${id}/admin-reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }

  const json = await res.json();
  return NextResponse.json(json);
}
