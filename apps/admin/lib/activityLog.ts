import { supabase } from './supabase';

export async function logActivity(params: {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
}) {
  const { error } = await supabase.from('admin_activity_log').insert({
    admin_email: params.adminEmail,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId,
    target_name: params.targetName,
    details: params.details ?? {},
  });

  if (error) {
    console.error('Failed to log admin activity:', error);
  }
}
