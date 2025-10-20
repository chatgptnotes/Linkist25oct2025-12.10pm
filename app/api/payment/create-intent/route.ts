import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Helper function to get Stripe instance
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-09-30.acacia',
  });
}

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { amount, currency = 'usd', orderData } = body;

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Initialize Stripe only when needed
    const stripe = getStripe();

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: orderData?.customerName || '',
        email: orderData?.email || '',
        orderType: 'NFC Card',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}