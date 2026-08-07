import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { z } from 'zod';

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.enum(['active', 'under_review', 'paused', 'rejected']),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parseResult = bulkUpdateSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input parameters', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, status } = parseResult.data;

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
