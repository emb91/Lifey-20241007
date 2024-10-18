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
    if (!isLoaded && !signUp) return null

    try {
      // 👉 Use the code provided by the user and attempt verification
      const signInAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // 👉 If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.push('/after-sign-up')
      } else {
        // 👉 If the status is not complete. User may need to complete further steps.
      }
    } catch (err) {
      // 👉 Something went wrong...
      console.error('Verification error:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(err.message);
      } else {
        setError('An unknown error occurred during verification');
      }
    }
  }

  return (
    <div className="mt-20 flex items-center justify-center">
      <form onSubmit={handleVerification}>
        <Card className="w-full sm:w-96">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Welcome! Please fill in the details to get started.</CardDescription>
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
                Verify
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
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
