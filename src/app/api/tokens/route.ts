// src/app/api/tokens/route.ts
// Fast, cached token list + search endpoint using Next.js native fetch caching.
// Removes axios, in-memory caches, and dynamic forcing. Errors bubble to caller for fallback.

import { NextRequest, NextResponse } from 'next/server';
import fallbackTokens from '@/config/fallbackTokens.json';

// Allow fetch-level caching directives to control behavior
export const revalidate = 0;

const JUPITER_LITE_API = 'https://lite-api.jup.ag/tokens/v2';

// Known high-profile verified tokens (hard-coded safety net)
const KNOWN_VERIFIED_TOKENS = new Set<string>([
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // jitoSOL
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', // bSOL
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Bonk
]);

const resolveLogo = (icon: string | undefined): string => {
  if (!icon) return '/token-fallback.png';
  if (icon.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${icon.slice(7)}`;
  return icon;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');

  // SEARCH MODE -------------------------------------------------------------
  if (search) {
    try {
      // Fetch verified tokens list (cached 15 min)
      const verifiedRes = await fetch(`${JUPITER_LITE_API}/tag?query=verified`, {
        next: { revalidate: 900 },
      });
      if (!verifiedRes.ok) throw new Error('Failed verified tag fetch');
      const verifiedJson = (await verifiedRes.json()) as any[];
      const verifiedSet = new Set<string>(verifiedJson.map((t) => t.id));

      // Perform search (cached 5 min)
      const searchRes = await fetch(
        `${JUPITER_LITE_API}/search?query=${encodeURIComponent(search)}`,
        { next: { revalidate: 300 } }
      );
      if (!searchRes.ok) throw new Error('Invalid search response');
      const searchJson = (await searchRes.json()) as any[];

      const results = searchJson.map((t: any) => ({
        address: t.id,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        logoURI: resolveLogo(t.icon),
        verified: verifiedSet.has(t.id) || t.isVerified || KNOWN_VERIFIED_TOKENS.has(t.id),
        tags: t.tags || [],
      }));

      return NextResponse.json({
        query: search,
        results,
        verifiedAddresses: Array.from(verifiedSet),
      });
    } catch (err) {
      // Local fallback search (non-network) for resilience
      const lowered = search.toLowerCase();
      const found = (fallbackTokens as any[])
        .filter(t =>
          t.address.toLowerCase().includes(lowered) ||
          t.symbol.toLowerCase().includes(lowered) ||
          t.name.toLowerCase().includes(lowered)
        )
        .map(t => ({
          ...t,
          verified: KNOWN_VERIFIED_TOKENS.has(t.address),
        }));
      return NextResponse.json({
        query: search,
        results: found,
        verifiedAddresses: Array.from(KNOWN_VERIFIED_TOKENS),
        fallback: true,
      });
    }
  }

  // FULL TOKEN LIST MODE ----------------------------------------------------
  try {
    // Fetch verified tokens (cached 15 min)
    const verifiedRes = await fetch(`${JUPITER_LITE_API}/tag?query=verified`, {
      next: { revalidate: 900 },
    });
    if (!verifiedRes.ok) throw new Error('Failed to fetch verified list');
    const verifiedJson = (await verifiedRes.json()) as any[];

    const tokens = verifiedJson.map((t: any) => ({
      address: t.id,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals,
      logoURI: resolveLogo(t.icon),
      verified: true,
      tags: t.tags || [],
    }));
    const verifiedAddresses = verifiedJson.map(t => t.id);

    return NextResponse.json({
      tokens,
      verifiedAddresses,
    });
  } catch (err) {
    // On failure, propagate empty list; client provider will fall back
    // eslint-disable-next-line no-console
    console.error('[Tokens API] Failed to fetch Jupiter token list:', err);
    return NextResponse.json({
      error: 'Failed to fetch token list from provider',
      tokens: [],
      verifiedAddresses: [],
    }, { status: 500 });
  }
}