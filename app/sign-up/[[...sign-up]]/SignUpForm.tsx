'use client'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
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
import { useSignUp, useSignIn } from '@clerk/nextjs'
import { OAuthStrategy } from '@clerk/types'

type Props = {
  setVerifying: (val: boolean) => void
}

function SignUpForm({ setVerifying }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [lastName, setLastName] = useState('')

  async function handleOAuthSignUp(strategy: OAuthStrategy) {
    if (!signUp || !signIn) return null

    try {
      const userExistsButNeedsToSignIn =
        signUp.verifications.externalAccount.status === 'transferable' &&
        signUp.verifications.externalAccount.error?.code === 'external_account_exists'

      if (userExistsButNeedsToSignIn) {
        const res = await signIn.create({ transfer: true })
        if (res.status === 'complete') {
          setActive({ session: res.createdSessionId })
        }
      }

      const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable'

      if (userNeedsToBeCreated) {
        const res = await signUp.create({ transfer: true })
        if (res.status === 'complete') {
          setActive({ session: res.createdSessionId })
        }
      } else {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/subscribe'
        })
      }
    } catch (err) {
      console.error('Error during OAuth sign up:', err)
    }
  }

  async function onSubmit() {
    if (!isLoaded && !signUp) return null

    try {
      await signUp.create({
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        password: password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      setVerifying(true)
    } catch (err) {
      console.error('Error during sign up:', err)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Welcome! Please fill in the details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name (optional)</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Michael"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name (optional)</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Scott"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                name="email"
                placeholder="michael@dundermifflin.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                name="password"
                required
              />
            </div>
          </div>
        </CardContent> 

        <CardFooter>
          <div className="grid w-full gap-y-4">
            <Button type="submit" disabled={!isLoaded}>
              Sign up for trial
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignUp('oauth_google')}
              disabled={!isLoaded}
              className="flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/sign-in">Already have an account? Sign in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}

export default SignUpForm


