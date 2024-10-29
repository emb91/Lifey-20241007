'use client'

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import BillingForm from '@/app/components/billingForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

export default function SubscribePage() {
  return (
    <Elements stripe={stripePromise}>
      <BillingForm />
    </Elements>
  );
}