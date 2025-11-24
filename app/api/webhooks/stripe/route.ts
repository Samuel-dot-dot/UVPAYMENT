import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  console.log('\n========== 🔔 WEBHOOK REQUEST RECEIVED ==========');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  console.log('Has signature:', !!signature);
  console.log('Body length:', body.length);

  if (!signature) {
    console.error('❌ Missing Stripe signature');
    return new NextResponse('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log('🔐 Verifying webhook signature...');
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('✅ Signature verified successfully!');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Webhook signature verification failed:', message);
    console.error('Error details:', err);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  try {
    console.log('\n========== 💳 STRIPE WEBHOOK RECEIVED ==========');
    console.log('Event Type:', event.type);
    console.log('Event ID:', event.id);

    // Handle successful checkout
    if (event.type === 'checkout.session.completed') {
      console.log('\n✅ CHECKOUT COMPLETED!');
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;

      console.log('User ID from metadata:', userId);
      console.log('Customer ID:', customerId);
      console.log('Session Details:', JSON.stringify(session, null, 2));

      if (!userId) {
        console.error('❌ CRITICAL: No userId in checkout session metadata');
        return NextResponse.json({ received: true, warning: 'No userId found' });
      }

      console.log(`\n📝 Updating user ${userId} to subscriber...`);

      // First check if the profile exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkError) {
        console.error('❌ ERROR FINDING USER:', checkError);
        console.error('User ID that failed:', userId);

        // Try to find by stripe_customer_id as fallback
        console.log('🔄 Trying to find user by stripe_customer_id...');
        const { data: fallbackProfile, error: fallbackError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!fallbackError && fallbackProfile) {
          console.log('✅ Found user by customer ID!');
          // Update using customer ID
          const { data: updatedData, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              role: 'subscriber',
              subscription_status: 'active',
            })
            .eq('stripe_customer_id', customerId)
            .select();

          if (updateError) {
            console.error('❌ UPDATE FAILED:', updateError);
            return new NextResponse('Database update failed', { status: 500 });
          }

          console.log('✅ USER UPGRADED SUCCESSFULLY (via customer ID)!');
          console.log('Updated Profile:', JSON.stringify(updatedData, null, 2));
          return NextResponse.json({ received: true });
        }

        return new NextResponse('User not found', { status: 500 });
      }

      console.log('✅ User found:', existingProfile.id);

      // Upgrade user to subscriber
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'subscriber',
          subscription_status: 'active',
          stripe_customer_id: customerId,
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ DATABASE UPDATE FAILED:', error);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', JSON.stringify(error, null, 2));
        return new NextResponse('Database update failed', { status: 500 });
      }

      console.log('✅ USER UPGRADED SUCCESSFULLY!');
      console.log('Updated Profile:', JSON.stringify(data, null, 2));
      console.log(`🎉 User ${userId} is now a SUBSCRIBER!`);
    }

    // Handle subscription deletion/cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      if (!customerId) {
        console.error('No customerId in subscription.deleted event');
        return NextResponse.json({ received: true, warning: 'No customerId found' });
      }

      // Downgrade user to guest
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'guest',
          subscription_status: 'inactive',
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Error downgrading profile after subscription deletion:', error);
        return new NextResponse('Database update failed', { status: 500 });
      }

      console.log(`Customer ${customerId} downgraded to guest`);
    }

    // Handle subscription updates (optional but recommended)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      let subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled' = 'inactive';
      let role: 'guest' | 'subscriber' = 'guest';

      // Map Stripe status to our database status
      if (status === 'active') {
        subscriptionStatus = 'active';
        role = 'subscriber';
      } else if (status === 'past_due') {
        subscriptionStatus = 'past_due';
        role = 'subscriber'; // Keep access during grace period
      } else if (status === 'canceled' || status === 'unpaid') {
        subscriptionStatus = 'canceled';
        role = 'guest';
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          role,
          subscription_status: subscriptionStatus,
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Error updating subscription status:', error);
      } else {
        console.log(`Customer ${customerId} subscription updated to ${status}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ WEBHOOK HANDLING ERROR!');
    console.error('Error Message:', message);
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full Error:', JSON.stringify(error, null, 2));

    // Return 200 anyway to prevent Stripe from retrying failed webhooks
    // Log the error for manual intervention
    console.error('⚠️ WARNING: Webhook failed but returning 200 to prevent retries');
    console.error('🔧 MANUAL ACTION NEEDED: Check logs and update user manually if needed');

    return NextResponse.json({
      received: true,
      error: message,
      requiresManualIntervention: true
    });
  }

  console.log('========== ✅ WEBHOOK PROCESSED SUCCESSFULLY ==========\n');
  return NextResponse.json({ received: true });
}
