import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const body = await req.json();
  const backendUrl =
    process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';
  const res = await fetch(`${backendUrl}/admin/${resolvedParams.id}/toggle`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const rawResponse = await res.json();
  const data = rawResponse.data ?? rawResponse;
  // Preserve the backend's status code (e.g. 403 when a non-super_admin tries this)
  // instead of always returning 200 — without this, adminFetch's 401/error handling
  // never fires on a failed toggle since the response always "succeeded".
  return NextResponse.json(data, { status: res.status });
}
