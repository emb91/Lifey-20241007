'use client'

import * as React from 'react'
import { useState } from 'react'
import SignUpForm from './SignUpForm'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import VerificationForm from './VerificationForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

export default function Page() {
  const [verifying, setVerifying] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  
  const options = {
    appearance: {
      theme: 'stripe',
    },
  }

  // Render the verification form when email has been verified
  if (verifying) {
    return <VerificationForm />
  }

  return (
    <div className="mt-20 flex items-center justify-center">
      <Elements options={options} stripe={stripePromise}>
        <SignUpForm 
          setVerifying={setVerifying} 
          showPayment={showPayment}
          setShowPayment={setShowPayment}
        />
      </Elements>
    </div>
  )
}




// // newer version
// 'use client'

// import * as React from 'react'
// import { useState } from 'react'
// import SignUpForm from './SignUpForm'
// import { loadStripe } from '@stripe/stripe-js'
// import { Elements } from '@stripe/react-stripe-js'
// import VerificationForm from './VerificationForm'

// export default function Page() {
//   const [verifying, setVerifying] = useState(false)
//   const options = {
//     appearance: {
//       theme: 'stripe',
//     },
//   }
//   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

//   // 👉 Render the verification form, meaning OTP email has been set
//   if (verifying) {
//     return <VerificationForm />
//   }

//   // 👉 Render the signup form by default
//   return (
//     <div className="mt-20 flex items-center justify-center">
//       {/* @ts-ignore */}
//       <Elements options={options} stripe={stripePromise}>
//         <SignUpForm setVerifying={setVerifying} />
//       </Elements>
//     </div>
//   )
// }




// // older version
// // 'use client'

// // import * as React from 'react'
// // import { useState } from 'react'
// // import SignUpForm from './SignUpForm'
// // import { loadStripe } from '@stripe/stripe-js'
// // import { Elements } from '@stripe/react-stripe-js'
// // import VerificationForm from './VerificationForm'
// // import { useSignUp } from '@clerk/nextjs'
// // import { useRouter } from 'next/navigation'

// // export default function Page() {
// //   const { isLoaded, signUp, setActive } = useSignUp()
// //   const [verifying, setVerifying] = useState(false)
// //   const router = useRouter()
  
// //   // 👉 Stripe configuration
// //   const options = {
// //     appearance: {
// //       theme: 'stripe',
// //     },
// //   }
// //   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

// //   // 👉 Handle the initial email setup and verification preparation
// //   const handleEmailSetup = async (email: string) => {
// //     if (!isLoaded || !signUp) return null

// //     try {
// //       await signUp.create({
// //         emailAddress: email
// //       })

// //       // Start the verification process
// //       await signUp.prepareEmailAddressVerification()
// //       setVerifying(true)
// //     } catch (err) {
// //       console.error('Error setting up email:', err)
// //       throw err // Let SignUpForm handle the error
// //     }
// //   }

// //   // 👉 Render the verification form when email has been set
// //   if (verifying) {
// //     return <VerificationForm />
// //   }

// //   // 👉 Render the signup form by default
// //   return (
// //     <div className="mt-20 flex items-center justify-center">
// //       <Elements options={options} stripe={stripePromise}>
// //         <SignUpForm setVerifying={setVerifying} onEmailSetup={handleEmailSetup} />
// //       </Elements>
// //     </div>
// //   )
// // }




// //oldest version
// // 'use client'

// // import * as React from 'react'
// // import { useState } from 'react'
// // import SignUpForm from './SignUpForm'
// // import { loadStripe } from '@stripe/stripe-js'
// // import { Elements } from '@stripe/react-stripe-js'
// // import VerificationForm from './VerificationForm'

// // export default function Page() {
// //   const [verifying, setVerifying] = useState(false)
// //   const options = {
// //     appearance: {
// //       theme: 'stripe',
// //     },
// //   }
// //   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

// //   // 👉 Render the verification form, meaning OTP email has been set
// //   if (verifying) {
// //     return <VerificationForm />
// //   }

// //   // 👉 Render the signup form by default
// //   return (
// //     <div className="mt-20 flex items-center justify-center">
// //       {/* @ts-ignore */}
// //       <Elements options={options} stripe={stripePromise}>
// //         <SignUpForm setVerifying={setVerifying} />
// //       </Elements>
// //     </div>
// //   )
// // }
