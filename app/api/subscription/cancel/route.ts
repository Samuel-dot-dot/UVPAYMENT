import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's stripe_customer_id from database
    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .select('stripe_customer_id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if ((profile as any).role !== 'subscriber') {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    if (!(profile as any).stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
    }

    // Find active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: (profile as any).stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end (user keeps access until billing cycle ends)
    const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    console.log(`✅ Subscription ${subscription.id} set to cancel at period end for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: cancelledSubscription.cancel_at,
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({
      error: 'Failed to cancel subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
