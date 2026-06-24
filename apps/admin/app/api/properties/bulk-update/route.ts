import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  const { ids, status } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'No property IDs provided' }, 
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  // If approving, also mark as admin-verified
  if (status === 'active') {
    updateData.verified_by_admin = true;
    updateData.verified_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .in('id', ids);

  if (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Bulk update failed' }, 
      { status: 500 }
    );
  }

  await logActivity({
    adminEmail: admin.email,
    action: `bulk_${status}_properties`,
    targetType: 'property',
    details: { count: ids.length, ids },
  });

  return NextResponse.json({ 
    success: true, 
    updated: ids.length 
  });
}
