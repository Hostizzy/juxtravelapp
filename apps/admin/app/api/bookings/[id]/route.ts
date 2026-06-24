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

  // Fetch details for logging
  const { data: bookingDetails } = await supabase
    .from('bookings')
    .select(`
      guest:users!guest_id(name),
      property:properties(name)
    `)
    .eq('id', id)
    .single();

  const guestObj = Array.isArray(bookingDetails?.guest) ? bookingDetails.guest[0] : bookingDetails?.guest;
  const propertyObj = Array.isArray(bookingDetails?.property) ? bookingDetails.property[0] : bookingDetails?.property;
  const targetName = `${guestObj?.name ?? 'Guest'} at ${propertyObj?.name ?? 'Property'}`;

  const { error } = await supabase
    .from('bookings')
    .update({
      status,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }

  await logActivity({
    adminEmail: admin.email,
    action: 'updated_booking_status',
    targetType: 'booking',
    targetId: id,
    targetName,
    details: { status }
  });

  return NextResponse.json({ success: true });
}
