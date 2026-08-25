import { NextResponse } from 'next/server'

export async function POST() {
  // TODO: Handle Stripe/MTN/Orange webhooks
  return NextResponse.json({ received: true })
}
