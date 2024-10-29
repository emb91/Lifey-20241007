'use client'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/app/components/ui/button'
import { useUser } from '@clerk/nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Label } from '@/app/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BillingForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { user } = useUser()
  const [error, setError] = useState('')
  const STRIPE_PRICE_ID = 'price_1QEpLsCeLdc7gkMRAVO1HwA2'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!elements || !stripe || !user) {
      return
    }

    try {
      const cardEl = elements.getElement(CardElement)
      if (cardEl) {
        const res = await stripe.createToken(cardEl)
        const cardToken = res?.token?.id || ''

        // Update user metadata directly
        await user.update({
          unsafeMetadata: {
            cardToken,
            priceId: STRIPE_PRICE_ID,
          },
        })

        router.push('/after-sign-up')
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Failed to process payment. Please try again.')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Please enter your payment information to complete signup.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-y-4">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Label>Card Information</Label>
          <div className="rounded border p-2">
            <CardElement />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Complete Signup
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}