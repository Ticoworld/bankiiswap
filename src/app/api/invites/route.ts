import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'

// Compatibility wrapper for legacy invite API.
// We no longer issue token-based invites; POST returns a referral link for the inviter.
export async function POST(request: NextRequest) {
  // Invites deprecated; return a generic login link for compatibility
  const origin = request.headers.get('origin') || new URL(request.url).origin
  const link = `${origin}/login`
  return NextResponse.json({ link })
}

// Accept an invite by mapping token to referrer wallet for unified onboarding.
// PUT /api/invites?token=<referrerWallet> body: { wallet }
export async function PUT(request: NextRequest) {
  // Invites flow removed; accept and no-op for backward compatibility
  const url = new URL(request.url)
  const token = (url.searchParams.get('token') || '').toLowerCase()
  return NextResponse.json({ success: true, inviter: token || null })
}
