import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { message } = await req.json() as { message: string };

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const res = await fetch(
    `${backendUrl}/conversations/${id}/admin-reply`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to send' }, { status: 500 }
    );
  }

  await logActivity({
    adminEmail: admin.email ?? admin.name,
    action: 'admin_replied_conversation',
    targetType: 'conversation',
    targetId: id,
    details: { message },
  });

  return NextResponse.json({ success: true });
}
