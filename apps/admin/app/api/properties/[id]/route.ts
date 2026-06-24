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
  const { status, rejection_reason, verified } = await req.json();

  // Fetch existing property name before update for auditing
  const { data: existingProperty } = await supabase
    .from('properties')
    .select('name')
    .eq('id', id)
    .single();
  const existingPropertyName = existingProperty?.name ?? 'Unknown Property';

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (status) updateData.status = status;
  if (rejection_reason !== undefined) {
    updateData.rejection_reason = rejection_reason;
  }
  
  // If verifying or approving, set verified flags
  if (verified || status === 'active') {
    updateData.verified_by_admin = true;
    updateData.verified_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating property status/verification:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }

  // Audit activity log
  let logAction = 'updated_property';
  if (verified || status === 'active') {
    logAction = verified ? 'verified_property' : 'approved_property';
  } else if (status === 'rejected') {
    logAction = 'rejected_property';
  }

  await logActivity({
    adminEmail: admin.email,
    action: logAction,
    targetType: 'property',
    targetId: id,
    targetName: existingPropertyName,
    details: { status, verified }
  });

  return NextResponse.json({ success: true });
}
