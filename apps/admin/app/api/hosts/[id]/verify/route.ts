import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { z } from 'zod';

const verifyHostSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const body = await req.json().catch(() => ({}));
  const parseResult = verifyHostSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input parameters', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { status } = parseResult.data;

  // Fetch host user details for logging
  const { data: hostUser } = await supabase
    .from('users')
    .select('name')
    .eq('id', resolvedParams.id)
    .single();
  const hostName = hostUser?.name ?? 'Unknown Host';

  const { error } = await supabase
    .from('host_profiles')
    .update({
      verification_status: status,
      verified: status === 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', resolvedParams.id);

  if (error) {
    console.error('Error updating host profile verification status:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }

  await logActivity({
    adminEmail: admin.email,
    action: status === 'approved' ? 'approved_host' : (status === 'rejected' ? 'rejected_host' : 'updated_host'),
    targetType: 'host',
    targetId: resolvedParams.id,
    targetName: hostName,
    details: { status }
  });

  return NextResponse.json({ success: true });
}
