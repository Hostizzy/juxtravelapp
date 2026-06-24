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

  const { id } = await params;
  const { status } = await req.json();

  // Fetch verification user details for logging
  const { data: verification } = await supabase
    .from('guest_verifications')
    .select(`
      user_id,
      user:users!user_id(name)
    `)
    .eq('id', id)
    .single();

  const userObj = Array.isArray(verification?.user) ? verification.user[0] : verification?.user;
  const targetName = userObj?.name ?? 'Unknown Guest';

  const { error } = await supabase
    .from('guest_verifications')
    .update({
      status,
      verified_at: status === 'verified' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }

  await logActivity({
    adminEmail: admin.email,
    action: status === 'verified' ? 'approved_kyc' : (status === 'rejected' ? 'rejected_kyc' : 'updated_kyc'),
    targetType: 'guest_kyc',
    targetId: verification?.user_id ?? id,
    targetName,
    details: { status }
  });

  return NextResponse.json({ success: true });
}
