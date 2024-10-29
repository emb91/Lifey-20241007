'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useState } from 'react'

export default function VerificationForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // 👉 Handles the verification process once the user has entered the validation code from email
  async function handleVerification(e: React.FormEvent) {
    e.preventDefault()
    console.log('Verification attempt starting...');
    
    // Check if the sign-up service is ready
    if (!isLoaded || !signUp) {
      console.error('Not ready:', { isLoaded, signUp });
      setError('Sign up service is not ready');
      return null;
    }

    try {
      // 👉 Use the code provided by the user and attempt verification
      console.log('Attempting verification with code:', code);
      const signInAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })
      console.log('Sign in attempt response:', signInAttempt);

      // 👉 If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        console.log('Verification complete, setting active session...');
        await setActive({ session: signInAttempt.createdSessionId })
        router.push('/subscribe')
      } else {
        // 👉 If the status is not complete. User may need to complete further steps.
        console.log('Verification incomplete:', signInAttempt.status);
        setError('Verification incomplete. Please try again.')
      }
    } catch (err) {
      // 👉 Something went wrong...
      console.error('Verification error:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred during verification');
      }
    }
  }

  return (
    <div className="mt-20 flex items-center justify-center">
      <form onSubmit={handleVerification}>
        <Card className="w-full sm:w-96">
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>Please enter the verification code sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-y-4">
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div>
              <Label htmlFor="code">Enter your verification code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                id="code"
                name="code"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid w-full gap-y-4">
              <Button type="submit" disabled={!isLoaded}>
                {isLoaded ? 'Verify' : 'Loading...'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
// 👉 new code = edits after this 20241028

// export default VerificationForm
// import * as React from 'react'
// import { useSignUp } from '@clerk/nextjs'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/app/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/app/components/ui/card'
// import { Input } from '@/app/components/ui/input'
// import { Label } from '@/app/components/ui/label'
// import { useState } from 'react'

// function VerificationForm() {
//   const { isLoaded, signUp, setActive } = useSignUp()
//   const [code, setCode] = useState('')
//   const router = useRouter()

//   // 👉 Handles the verification process once the user has entered the validation code from email
//   async function handleVerification(e: React.FormEvent) {
//     e.preventDefault()
//     if (!isLoaded && !signUp) return null

//     try {
//       // 👉 Use the code provided by the user and attempt verification
//       const signInAttempt = await signUp.attemptEmailAddressVerification({
//         code,
//       })

//       // 👉 If verification was completed, set the session to active
//       // and redirect the user
//       if (signInAttempt.status === 'complete') {
//         await setActive({ session: signInAttempt.createdSessionId })
//         router.push('/after-sign-up')
//       } else {
//         // 👉 If the status is not complete. User may need to complete further steps.
//       }
//     } catch (err) {
//       // 👉 Something went wrong...
//     }
//   }

//   return (
//     <div className="mt-20 flex items-center justify-center">
//       <form onSubmit={handleVerification}>
//         <Card className="w-full sm:w-96">
//           <CardHeader>
//             <CardTitle>Create your account</CardTitle>
//             <CardDescription>Welcome! Please fill in the details to get started.</CardDescription>
//           </CardHeader>
//           <CardContent className="grid gap-y-4">
//             <div>
//               <Label htmlFor="code">Enter your verification code</Label>
//               <Input
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 id="code"
//                 name="code"
//                 required
//               />
//             </div>
//           </CardContent>
//           <CardFooter>
//             <div className="grid w-full gap-y-4">
//               <Button type="submit" disabled={!isLoaded}>
//                 Verify
//               </Button>
//             </div>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   )
// }

// export default VerificationForm

