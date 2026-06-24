import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

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
  const { status } = await req.json();

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
