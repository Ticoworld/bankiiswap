import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const wallet = (url.searchParams.get('wallet') || '').toLowerCase()
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })

  // Access gating removed: always allow
  const res = { access: true as const, reason: 'open_access' as const }
  const resp = NextResponse.json(res)
  resp.cookies.set('access-ok', '1', { path: '/', maxAge: 60 * 60 * 24 })
  return resp
}
