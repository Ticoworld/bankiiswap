// src/app/api/stats/route.ts (DB-free placeholder)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  // Lightweight placeholder stats while analytics backend is disabled
  return NextResponse.json({
    totalVolume: "Analytics",
    totalSwaps: "In",
    totalEarnings: "Development",
    uniqueWallets: "Q1 2025",
    lastUpdated: "Analytics system in development",
    status: "analytics_not_configured"
  })
}

export async function POST(_request: NextRequest) {
  // Timeframe stats not available without analytics backend
  return NextResponse.json({ 
    error: 'Analytics not configured yet' 
  }, { status: 503 })
}
