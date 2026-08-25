import { proxyGet } from '@/lib/nest-proxy'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const tx_ref = request.nextUrl.searchParams.get('tx_ref') ?? ''
  const transaction_id = request.nextUrl.searchParams.get('transaction_id') ?? ''
  return proxyGet(`/payments/flutterwave/verify?tx_ref=${encodeURIComponent(tx_ref)}&transaction_id=${encodeURIComponent(transaction_id)}`, request)
}
