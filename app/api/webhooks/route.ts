
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { Stripe } from 'stripe'
import { createWebhookSupabaseClient } from '../../utils/createWebhookSupabaseClient'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// Add this function at the top level
async function setupStripeCustomer(userData: any, metadata: any) {
  const { cardToken, priceId } = metadata;
  if (!cardToken || !priceId) return;

  try {
    // Create a payment method using the card token
    const pm = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: cardToken as string },
    });
    console.log('Payment method created:', pm.id);

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email: userData.email_addresses[0].email_address,
      payment_method: pm.id,
      invoice_settings: { default_payment_method: pm.id },
    });
    console.log('Customer created:', customer.id);

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      default_payment_method: pm.id,
      trial_period_days: 14,
      items: [{ price: priceId as string }],
    });
    console.log('Subscription created:', subscription.id);

    // Update the user's metadata in Clerk with Stripe IDs
    await clerkClient.users.updateUser(userData.id, {
      publicMetadata: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
      },
    });
    console.log('User metadata updated successfully');
  } catch (error) {
    console.error('Error setting up Stripe customer:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }
  console.log('WEBHOOK_SECRET is logged')

  // Get the headers from the request
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Log the headers for debugging
  console.log('Headers:', {
    svix_id,
    svix_timestamp,
    svix_signature,
  })

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body of the request
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle user creation event
  if (evt.type === 'user.created') {
    console.log('user created:', evt.data.id)
    const supabase = createWebhookSupabaseClient()
    
    try {
      // Get metadata from the event for Stripe setup
      const { cardToken, priceId } = evt.data.unsafe_metadata
      console.log('Metadata received:', { hasCardToken: !!cardToken, priceId })

      // Create the user record in Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          user_id: evt.data.id,
          user_firstname: evt.data.first_name,
          user_lastname: evt.data.last_name,
          user_email: evt.data.email_addresses[0].email_address,
        })

      if (userError) {
        console.error('Error inserting user:', userError.message, userError.details)
        throw userError
      }

      // Only proceed with Stripe setup if we have the required metadata
      if (cardToken && priceId) {
        // Create a payment method using the card token
        const pm = await stripe.paymentMethods.create({
          type: 'card',
          card: { token: cardToken as string },
        })
        console.log('Payment method created:', pm.id)

        // Create a Stripe customer
        const customer = await stripe.customers.create({
          email: evt.data.email_addresses[0].email_address,
          payment_method: pm.id,
          invoice_settings: { default_payment_method: pm.id },
        })
        console.log('Customer created:', customer.id)

        // Create a subscription for the customer
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          default_payment_method: pm.id,
          trial_period_days: 14,
          items: [{ price: priceId as string }],
        })
        console.log('Subscription created:', subscription.id)

        // Update the user's metadata in Clerk with Stripe IDs
        await clerkClient.users.updateUser(evt.data.id, {
          publicMetadata: {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
          },
        })
        console.log('User metadata updated successfully')
      }
    } catch (error) {
      console.error('Error in user creation process:', error)
      throw error
    }
  }

  // Handle user update event
  if (evt.type === 'user.updated') {
    console.log('user updated:', evt.data.id)
    const supabase = createWebhookSupabaseClient()

    // Check if we need to setup Stripe
    if (evt.data.unsafe_metadata?.cardToken && !evt.data.public_metadata?.stripeCustomerId) {
      await setupStripeCustomer(evt.data, evt.data.unsafe_metadata);
    }

    // Convert the timestamp from milliseconds to seconds, then to ISO string
    const lastUpdated = new Date(evt.data.created_at / 1000).toISOString()
  
    const { data, error } = await supabase
      .from('users')
      .update({
        user_firstname: evt.data.first_name,
        user_lastname: evt.data.last_name,
        user_email: evt.data.email_addresses[0].email_address,
        last_updated: lastUpdated,
      })
      .eq('user_id', evt.data.id)

    if (error) {
      console.error('Error updating user:', error.message, error.details)
    } else {
      console.log('User updated:', data)
    }
  }

  // Handle user deletion event
  if (evt.type === 'user.deleted') {
    console.log('user deleted:', evt.data.id)
    const supabase = createWebhookSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', evt.data.id)

    if (error) {
      console.error('Error deleting user:', error.message, error.details)
    } else {
      console.log('User deleted:', data)
    }
  }

  // Log the webhook details
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  // Return a 200 status code to acknowledge receipt of the webhook
  return new Response('', { status: 200 })
}

// code works - does not include stripe
// import { Webhook } from 'svix'
// import { headers } from 'next/headers'
// import { WebhookEvent } from '@clerk/nextjs/server'
// import { createClerkSupabaseClient } from '../../utils/createClerkSupabaseClient';
// import { createWebhookSupabaseClient } from '../../utils/createWebhookSupabaseClient';

// export async function POST(req: Request) {
//   // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

//   if (!WEBHOOK_SECRET) {
//     throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
//   }
//   console.log('WEBHOOK_SECRET is logged')

//   // Get the headers
//   const headerPayload = headers()
//   const svix_id = headerPayload.get('svix-id')
//   const svix_timestamp = headerPayload.get('svix-timestamp')
//   const svix_signature = headerPayload.get('svix-signature')

//    // Log the headers
//   console.log('Headers:', {
//     svix_id,
//     svix_timestamp,
//     svix_signature,
//   });
//   // If there are no headers, error out
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response('Error occured -- no svix headers', {
//       status: 400,
//     })
//   }
 

//   // Get the body
//   const payload = await req.json()
//   const body = JSON.stringify(payload)

//   // Create a new Svix instance with your secret.
//   const wh = new Webhook(WEBHOOK_SECRET)

//   let evt: WebhookEvent

//   // Verify the payload with the headers
//   try {
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent
//   } catch (err) {
//     console.error('Error verifying webhook:', err)
//     return new Response('Error occured', {
//       status: 400,
//     })
//   }

// if (evt.type === 'user.created') {
//     console.log('user created:', evt.data.id);
//     const supabase = createWebhookSupabaseClient();
    
    
//     const { data, error } = await supabase
//       .from('users')
//       .insert({
//         user_id: evt.data.id,
//         user_firstname: evt.data.first_name,
//         user_lastname: evt.data.last_name,
//         user_email: evt.data.email_addresses[0].email_address,
//       });
  
//     if (error) {
//       console.error('Error inserting user:', error.message, error.details);
//     } else {
//       console.log('User created inserted:', data);
//     }
//   }

//   if (evt.type === 'user.updated') {
//     console.log('user updated:', evt.data.id);
//     const supabase = createWebhookSupabaseClient();

// // Convert the timestamp from milliseconds to seconds, then to ISO string
//     const lastUpdated = new Date(evt.data.created_at / 1000).toISOString();
  
//     const { data, error } = await supabase
//       .from('users')
//       .update({
//         user_firstname: evt.data.first_name,
//         user_lastname: evt.data.last_name,
//         user_email: evt.data.email_addresses[0].email_address,
//         last_updated: lastUpdated,
//       })
//       .eq('user_id', evt.data.id);

//     if (error) {
//       console.error('Error updating user:', error.message, error.details);
//     } else {
//       console.log('User updated:', data);
//     }
//   }

//   if (evt.type === 'user.deleted') {
//     console.log('user deleted:', evt.data.id);
//     const supabase = createWebhookSupabaseClient();
    
//     const { data, error } = await supabase
//       .from('users')
//       .delete()
//       .eq('user_id', evt.data.id);

//     if (error) {
//       console.error('Error deleting user:', error.message, error.details);
//     } else {
//       console.log('User deleted:', data);
//     }
//   }

//   // For this guide, you simply log the payload to the console
//   const { id } = evt.data
//   const eventType = evt.type
//   console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
//   console.log('Webhook body:', body)

//   return new Response('', { status: 200 })
// }
