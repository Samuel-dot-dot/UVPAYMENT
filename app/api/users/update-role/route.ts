import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;

    // Only admins and owners can update roles
    if (!['admin', 'owner'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    // Validate input
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // Validate role value
    if (!['guest', 'subscriber', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Permission checks: admins can only promote to subscriber, not admin
    if (userRole === 'admin' && role === 'admin') {
      return NextResponse.json({
        error: 'Only owners can promote users to admin'
      }, { status: 403 });
    }

    // Prevent modifying owner accounts
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetUser?.role === 'owner') {
      return NextResponse.json({
        error: 'Cannot modify owner accounts'
      }, { status: 403 });
    }

    // Update the user's role
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        role,
        // Update subscription status when changing role
        subscription_status: role === 'subscriber' ? 'active' : (role === 'guest' ? 'inactive' : targetUser?.role === 'subscriber' ? 'active' : 'inactive')
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({
        error: 'Failed to update user role',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ User ${userId} role updated to ${role} by ${userRole} ${session.user.id}`);

    return NextResponse.json({
      success: true,
      user: data
    });

  } catch (error) {
    console.error('Error in update-role API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
