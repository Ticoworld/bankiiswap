import { NextResponse } from 'next/server'

// DB-free health check placeholder for Supabase (feature disabled)
export async function GET() {
  return NextResponse.json({ ok: true, configured: false })
}
