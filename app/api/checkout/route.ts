import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    if (!process.env.STRIPE_PRODUCT_ID) {
      return NextResponse.json({ error: 'Stripe product not configured' }, { status: 500 });
    }

    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let customerId: string | undefined = (profile as any)?.stripe_customer_id ?? undefined;

    // Verify customer exists in Stripe, or create new one
    if (customerId) {
      try {
        // Check if customer exists in Stripe
        await stripe.customers.retrieve(customerId);
      } catch (err: any) {
        if (err.code === 'resource_missing') {
          console.log('Customer not found in Stripe, creating new one');
          customerId = undefined; // Will create new customer below
        } else {
          throw err; // Re-throw other errors
        }
      }
    }

    // Create Stripe customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      // Save the customer ID to the database
      const { error: updateError } = await (supabaseAdmin as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating profile with customer ID:', updateError);
        // Continue anyway, the customer is created in Stripe
      }
    }

    // Get the default price for the product
    const product = await stripe.products.retrieve(process.env.STRIPE_PRODUCT_ID!);

    if (!product.default_price) {
      return NextResponse.json({
        error: 'No default price set for this product. Please set a default price in Stripe Dashboard.'
      }, { status: 500 });
    }

    const priceId = typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price.id;

    // Determine the origin for redirect URLs
    const origin =
      req.headers.get('origin') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      new URL('/', req.url).origin;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { userId: session.user.id },
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Checkout failed: ${message}` }, { status: 500 });
  }
}
