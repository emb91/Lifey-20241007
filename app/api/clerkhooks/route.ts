// // newest version
// import { createWebhooksHandler } from '@brianmmdev/clerk-webhooks-handler'
// import { Stripe } from 'stripe'
// import { clerkClient } from '@clerk/nextjs/server'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// const handler = createWebhooksHandler({
//   onUserCreated: async (user) => {
//     try {
//       console.log('onUserCreated webhook triggered for user:', user.id)
      
//       // 👉 Parse the unsafe_metadata from the user payload
//       const { cardToken, priceId } = user.unsafe_metadata
//       console.log('Metadata received:', { hasCardToken: !!cardToken, priceId })
      
//       if (!cardToken || !priceId) {
//         console.log('Missing required metadata, skipping Stripe setup')
//         return
//       }

//       // 👉 Create payment method
//       const pm = await stripe.paymentMethods.create({
//         type: 'card',
//         card: { token: cardToken as string },
//       })
//       console.log('Payment method created:', pm.id)

//       // 👉 Create customer
//       const customer = await stripe.customers.create({
//         email: user?.email_addresses[0].email_address,
//         payment_method: pm.id,
//         invoice_settings: { default_payment_method: pm.id },
//       })
//       console.log('Customer created:', customer.id)

//       // 👉 Create subscription
//       const subscription = await stripe.subscriptions.create({
//         customer: customer.id,
//         default_payment_method: pm.id,
//         trial_period_days: 14,
//         items: [{ price: priceId as string }],
//       })
//       console.log('Subscription created:', subscription.id)

//       // 👉 Update Clerk user metadata
//       await clerkClient.users.updateUser(user.id, {
//         publicMetadata: {
//           stripeCustomerId: customer.id,
//           stripeSubscriptionId: subscription.id,
//         },
//       })
//       console.log('User metadata updated successfully')

//     } catch (error) {
//       console.error('Error in webhook handler:', error)
//       throw error // Re-throw to ensure webhook knows it failed
//     }
//   },
// })

// export const POST = handler.POST


// // newer version
// // import { createWebhooksHandler } from '@brianmmdev/clerk-webhooks-handler'
// // import { Stripe } from 'stripe'
// // import { clerkClient } from '@clerk/nextjs/server'

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// // const handler = createWebhooksHandler({
// //   onUserCreated: async (user) => {
// //     // 👉 Parse the unsafe_metadata from the user payload
// //     const { cardToken, priceId } = user.unsafe_metadata
// //     if (!cardToken || !priceId) {
// //       console.log('Missing cardToken or priceId, returning')
// //       return
// //     }

// //     // 👉 Stripe operations will go here...
// //     const pm = await stripe.paymentMethods.create({
// //       type: 'card',
// //       card: {
// //         token: cardToken as string,
// //       },
// //     })


// //     const customer = await stripe.customers.create({
// //       email: user?.email_addresses[0].email_address,
// //       payment_method: pm.id,
// //     })


// //     const subscription = await stripe.subscriptions.create({
// //       customer: customer.id,
// //       default_payment_method: pm.id,
// //       trial_period_days: 14,
// //       items: [
// //         {
// //           price: priceId as string,
// //         },
// //       ],
// //     })

// //     await clerkClient.users.updateUser(user.id, {
// //       publicMetadata: {
// //         stripeCustomerId: customer.id,
// //         stripeSubscriptionId: subscription.id,
// //       },
// //     })


// //   },
// // })

// // export const POST = handler.POST





// // oldest version
// // import { createWebhooksHandler } from '@brianmmdev/clerk-webhooks-handler'
// // import { Stripe } from 'stripe'
// // import { clerkClient } from '@clerk/nextjs/server'

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// // const handler = createWebhooksHandler({
// //   onUserCreated: async (user) => {
// //     console.log('onUserCreated webhook triggered')
// //     // 👉 Parse the unsafe_metadata from the user payload
// //     const { cardToken, priceId } = user.unsafe_metadata
// //     console.log('Parsed unsafe_metadata:', { cardToken: !!cardToken, priceId })
// //     if (!cardToken || !priceId) {
// //       console.log('Missing cardToken or priceId, returning')
// //       return
// //     }

// //     // 👉 Stripe operations will go here...
// //     console.log('Starting Stripe operations')

// //     try {
// //       const pm = await stripe.paymentMethods.create({
// //         type: 'card',
// //         card: {
// //           token: cardToken as string,
// //         },
// //       })
// //       console.log('Payment method created:', pm.id)

// //       const customer = await stripe.customers.create({
// //         email: user?.email_addresses[0].email_address,
// //         payment_method: pm.id,
// //       })
// //       console.log('Customer created:', customer.id)

// //       const subscription = await stripe.subscriptions.create({
// //         customer: customer.id,
// //         default_payment_method: pm.id,
// //         trial_period_days: 14,
// //         items: [
// //           {
// //             price: priceId as string,
// //           },
// //         ],
// //       })
// //       console.log('Subscription created:', subscription.id)

// //       await clerkClient.users.updateUser(user.id, {
// //         publicMetadata: {
// //           stripeCustomerId: customer.id,
// //           stripeSubscriptionId: subscription.id,
// //         },
// //       })
// //       console.log('User metadata updated')
// //     } catch (error) {
// //       console.error('Error in Stripe operations:', error)
// //     }
// //   },
// // })

// // export const POST = handler.POST
