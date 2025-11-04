// src/app/api/log-swap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAnalyticsEnabled } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { checkRateLimit } from '@/lib/auth'
import { upsertUserPnlCache, getUserPnl } from '@/lib/pnl'
import { SwapLogSchema, validateInput } from '@/lib/validation' // 🔒 SECURITY: Import validation

export async function POST(request: NextRequest) {
  try {
    // Check if analytics is enabled (Phase 2 feature)
    if (!isAnalyticsEnabled()) {
      console.log('Analytics not configured - skipping swap logging')
      return NextResponse.json({ 
        success: true, 
        message: 'Analytics not configured yet' 
      })
    }

    const body = await request.json()
    
    // 🔒 SECURITY: Validate input data before processing
    let validatedData;
    try {
      validatedData = validateInput(SwapLogSchema, body);
    } catch (error) {
      console.error('[log-swap] Validation error:', error);
      return NextResponse.json(
        { error: 'Invalid input data', details: error instanceof Error ? error.message : 'Unknown validation error' },
        { status: 400 }
      );
    }
    
    // Debug: log validated analytics payload
    console.log('[log-swap] Validated body:', JSON.stringify(validatedData));
    
    const {
      walletAddress,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      fromUsdValue,
      toUsdValue,
      feesPaid,
      feesUsdValue,
      signature,
      blockTime,
      jupiterFee,
      platformFee,
      slippage,
      routePlan,
      fee_token_symbol,
      fee_token_mint
    } = validatedData;

    // Prepare swap record to match database schema
    const swapRecord = {
      wallet_address: walletAddress,
      from_token: fromToken,
      to_token: toToken,
  from_amount: fromAmount !== undefined ? parseFloat(String(fromAmount)) || 0 : 0,
  to_amount: toAmount !== undefined ? parseFloat(String(toAmount)) || 0 : 0,
  from_usd_value: fromUsdValue !== undefined ? parseFloat(String(fromUsdValue)) : null,
  to_usd_value: toUsdValue !== undefined ? parseFloat(String(toUsdValue)) : null,
  fees_paid: feesPaid !== undefined ? parseFloat(String(feesPaid)) : null,
  fees_usd_value: feesUsdValue !== undefined ? parseFloat(String(feesUsdValue)) : null,
  signature: signature,
  block_time: blockTime !== undefined && blockTime !== null ? parseInt(String(blockTime)) : null,
  jupiter_fee: jupiterFee !== undefined ? parseFloat(String(jupiterFee)) : null,
  platform_fee: platformFee !== undefined ? parseFloat(String(platformFee)) : null,
  slippage: slippage !== undefined ? parseFloat(String(slippage)) : null,
      route_plan: routePlan || null,
      fee_token_symbol: fee_token_symbol || null,
      fee_token_mint: fee_token_mint || null
    }

    // Insert into Supabase
    const client = (supabaseAdmin || supabase)!
    // simple rate-limit: 30 swaps per minute per wallet (analytics logging)
    if (!checkRateLimit(`log-swap:${walletAddress}`, 30, 60_000)) {
      try { await client.from('event_logs').insert([{ event_type: 'fraud_velocity_cap', wallet_address: walletAddress, metadata: { reason: 'swap_log_rate_limit' } }]) } catch {}
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const { data, error } = await client
      .from('swap_records')
      .insert([swapRecord])
      .select()

    if (error) {
      // Handle duplicate signature errors gracefully
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { success: true, message: 'Swap already logged' },
          { status: 200 }
        )
      }
      
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to log swap' },
        { status: 500 }
      )
    }

    // Best-effort hooks (non-blocking) - Gamification removed in BankiiSwap rebrand
    const record = data?.[0]
    if (record) {
      Promise.allSettled([
        // opportunistic P&L cache update
        (async () => { const s = await getUserPnl(record.wallet_address); await upsertUserPnlCache(record.wallet_address, s) })(),
      ])
    }

    return NextResponse.json({ success: true, data: record })

  } catch (error) {
    console.error('Log swap API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}