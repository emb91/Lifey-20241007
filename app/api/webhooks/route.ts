import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '../../utils/createClerkSupabaseClient';
import { createWebhookSupabaseClient } from '../../utils/createWebhookSupabaseClient';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }
  console.log('WEBHOOK_SECRET is logged')

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

   // Log the headers
  console.log('Headers:', {
    svix_id,
    svix_timestamp,
    svix_signature,
  });
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }
 

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
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
    return new Response('Error occured', {
      status: 400,
    })
  }

//   // Do something with the payload
// const supabase = createWebhookSupabaseClient();
// const { data, error } = await supabase
//   .from('users')
//   .select('user_id, user_firstname, user_lastname, user_email')
//   .eq('user_id', evt.data.id)
//   .single();

// if (error) {
//   console.error('Error reading user:', error.message, error.details);
// } else {
//   console.log('User read successfully:', data);
// }

if (evt.type === 'user.created') {
    console.log('user created:', evt.data.id);
    const supabase = createWebhookSupabaseClient();
    
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: evt.data.id,
        user_firstname: evt.data.first_name,
        user_lastname: evt.data.last_name,
        user_email: evt.data.email_addresses[0].email_address,
      });
  
    if (error) {
      console.error('Error inserting user:', error.message, error.details);
    } else {
      console.log('User created inserted:', data);
    }
  }

  if (evt.type === 'user.updated') {
    console.log('user updated:', evt.data.id);
    const supabase = createWebhookSupabaseClient();

// Convert the timestamp from milliseconds to seconds, then to ISO string
    const lastUpdated = new Date(evt.data.created_at / 1000).toISOString();
  
    const { data, error } = await supabase
      .from('users')
      .update({
        user_firstname: evt.data.first_name,
        user_lastname: evt.data.last_name,
        user_email: evt.data.email_addresses[0].email_address,
        last_updated: lastUpdated,
      })
      .eq('user_id', evt.data.id);

    if (error) {
      console.error('Error updating user:', error.message, error.details);
    } else {
      console.log('User updated:', data);
    }
  }

  if (evt.type === 'user.deleted') {
    console.log('user deleted:', evt.data.id);
    const supabase = createWebhookSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', evt.data.id);

    if (error) {
      console.error('Error deleting user:', error.message, error.details);
    } else {
      console.log('User deleted:', data);
    }
  }

  // For this guide, you simply log the payload to the console
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  return new Response('', { status: 200 })
}