// src/app/api/log-swap/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log swap for debugging (no database storage)
    if (process.env.NODE_ENV === 'development') {
      console.log('[log-swap] Swap completed:', {
        wallet: body.walletAddress,
        from: `${body.fromAmount} ${body.fromToken}`,
        to: `${body.toAmount} ${body.toToken}`,
        signature: body.signature
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Swap logged' 
    })
  } catch (error) {
    console.error('Swap logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log swap' },
      { status: 500 }
    )
  }
}
