// src/app/api/tokens/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CachedEntry = { data: any; timestamp: number };

const TOKEN_SEARCH_CACHE = new Map<string, CachedEntry>();
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache for searches

const DEFAULT_TIMEOUT_MS = 10_000; // default fetch timeout

// --- Helpers -----------------------------------------------------------------

/**
 * Check a string for Base58 charset commonly used by Solana pubkeys.
 * Permissive length: 32..64 (covers bad/padded inputs, but filters obvious junk).
 */
const isBase58 = (s: string | null | undefined): boolean => {
  if (!s) return false;
  const trimmed = s.trim();
  // Base58 charset (no 0,O,I,l)
  // Accept only characters in the Base58 set
  // Note: doesn't guarantee the key is a valid Solana pubkey, but filters common junk.
  // eslint-disable-next-line no-useless-escape
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(trimmed) && trimmed.length >= 32 && trimmed.length <= 64;
};

/**
 * Extracts the first plausible base58 substring from an input.
 * Useful when users paste "MINTpump" or include extra words.
 */
const sanitizeMint = (input: string | null | undefined): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  // Find first run of base58 chars length >= 32
  const match = trimmed.match(/[1-9A-HJ-NP-Za-km-z]{32,64}/);
  return match ? match[0] : null;
};

/**
 * Small helper that performs fetch with timeout using AbortSignal.timeout
 */
const fetchWithTimeout = async (url: string, init: RequestInit = {}, timeout = DEFAULT_TIMEOUT_MS) => {
  // AbortSignal.timeout is available in Node 18+. If not available in your env, replace with AbortController.
  const res = await fetch(url, { ...init, signal: (AbortSignal as any).timeout(timeout) });
  return res;
};

/**
 * Safe JSON parse returning null on error
 */
const safeJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// --- Logo resolution logic (kept from your original) ------------------------

const resolveIpfs = (uri: string | undefined | null): string => {
  if (!uri) return '/token-fallback.png';
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
};

const getBestLogoUri = (pair: any, baseToken: any): string => {
  const logoSources = [
    pair?.info?.imageUrl,
    baseToken?.logoURI,
    pair?.baseToken?.logoURI,
    `https://dd.dexscreener.com/ds-data/tokens/solana/${baseToken?.address}.png?key=da8880`,
    `https://dd.dexscreener.com/ds-data/tokens/solana/${baseToken?.address}.png`,
  ].filter(Boolean) as string[];

  const selectedLogo = logoSources[0];
  if (selectedLogo && !selectedLogo.startsWith('http')) {
    return `https://dd.dexscreener.com${selectedLogo}`;
  }
  return selectedLogo || '/token-fallback.png';
};

// --- Provider lookups -------------------------------------------------------

/**
 * Query DexScreener for token pairs.
 * Returns parsed JSON or null.
 */
const queryDexScreener = async (mint: string): Promise<any | null> => {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`;
    const res = await fetchWithTimeout(url, {
  headers: { Accept: 'application/json', 'User-Agent': 'BankiiSwap/1.0' },
    }, 10_000);
    if (!res.ok) {
      // 404 means no pairs known
      return null;
    }
    return await safeJson(res);
  } catch (err) {
    // network/DNS error or timeout
    // eslint-disable-next-line no-console
    console.warn('[Token Search] DexScreener fetch failed:', err);
    return null;
  }
};

/**
 * Query Jupiter Token API V2 (lite host preferred).
 * Returns matching token object or null.
 */
const queryJupiterV2 = async (mintOrQuery: string): Promise<any | null> => {
  try {
    const host = 'https://lite-api.jup.ag'; // prefer lite host (no key) for existence checks
    const url = `${host}/tokens/v2/search?query=${encodeURIComponent(mintOrQuery)}`;
    const res = await fetchWithTimeout(url, {
  headers: { Accept: 'application/json', 'User-Agent': 'BankiiSwap/1.0' },
    }, 5_000);

    if (!res.ok) {
      // non-200 — return null and log
      // eslint-disable-next-line no-console
      console.warn(`[Token Search] Jupiter V2 returned status ${res.status} for ${mintOrQuery}`);
      return null;
    }

    const json = await safeJson(res);
    if (!Array.isArray(json) || json.length === 0) return null;

    // Find exact id/address match if possible (v2 returns { id, name, symbol, ... })
    const exact = json.find((t: any) => t.id === mintOrQuery || t.address === mintOrQuery);
    return exact || json[0];
  } catch (err) {
    // network error / DNS / timeout
    // eslint-disable-next-line no-console
    console.warn('[Token Search] Jupiter V2 lookup failed:', err);
    return null;
  }
};

/**
 * Query Helius token metadata endpoint as a fallback.
 * Requires process.env.HELIUS_API_KEY to be set for production use.
 * If no key available, we skip Helius.
 */
const queryHelius = async (mint: string): Promise<any | null> => {
  const key = process.env.HELIUS_API_KEY;
  if (!key) return null;

  try {
    const url = `https://api.helius.xyz/v0/token-metadata?api-key=${encodeURIComponent(key)}&mint=${encodeURIComponent(mint)}`;
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 6_000);
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[Token Search] Helius returned ${res.status} for ${mint}`);
      return null;
    }
    const json = await safeJson(res);
    if (!json) return null;
    // Helius returns an array for this endpoint
    return Array.isArray(json) ? json[0] : json;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[Token Search] Helius lookup failed:', err);
    return null;
  }
};

// --- Main handler -----------------------------------------------------------

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q') ?? '';
  const sanitized = sanitizeMint(rawQuery);

  if (!sanitized || !isBase58(sanitized)) {
    return NextResponse.json({ error: 'Invalid or malformed token address' }, { status: 400 });
  }

  const query = sanitized;
  const cacheKey = query.toLowerCase();
  const cached = TOKEN_SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
    // eslint-disable-next-line no-console
    console.log(`[Token Search] 📦 Returning cached result for ${query}`);
    return NextResponse.json(cached.data);
  }

  // Start searching: DexScreener first (pair + logo), then Jupiter V2, then Helius.
  try {
    // 1) DexScreener - pairs (liquidity + logos)
    // eslint-disable-next-line no-console
    console.log(`[Token Search] 🔍 Searching DexScreener for: ${query}`);
    const dsData = await queryDexScreener(query);

    if (dsData && Array.isArray(dsData.pairs) && dsData.pairs.length > 0) {
      // find best Solana pair(s)
      const solanaPairs = dsData.pairs.filter(
        (p: any) => p.chainId === 'solana' && p.baseToken?.address?.toLowerCase() === query.toLowerCase(),
      );

      if (solanaPairs.length > 0) {
        const sortedPairs = solanaPairs.sort((a: any, b: any) => {
          // prefer raydium first
          if (a.dexId === 'raydium' && b.dexId !== 'raydium') return -1;
          if (b.dexId === 'raydium' && a.dexId !== 'raydium') return 1;
          const aLiquidity = parseFloat(a.liquidity?.usd ?? '0');
          const bLiquidity = parseFloat(b.liquidity?.usd ?? '0');
          return bLiquidity - aLiquidity;
        });

        const bestPair = sortedPairs[0];
        const baseToken = bestPair.baseToken ?? {};

        const token = {
          address: baseToken.address ?? query,
          name: baseToken.name ?? 'Unknown Token',
          symbol: baseToken.symbol ?? 'UNK',
          decimals: Number(baseToken.decimals ?? 6),
          logoURI: getBestLogoUri(bestPair, baseToken),
          price: bestPair.priceUsd ? Number(bestPair.priceUsd) : undefined,
          verified: false,
          isFromDexScreener: true,
          tags: ['unverified'],
          dexScreenerData: {
            dexId: bestPair.dexId,
            pairAddress: bestPair.pairAddress,
            liquidity: bestPair.liquidity,
            volume24h: bestPair.volume?.h24,
            priceChange24h: bestPair.priceChange?.h24,
          },
        };

        TOKEN_SEARCH_CACHE.set(cacheKey, { data: token, timestamp: Date.now() });
        // eslint-disable-next-line no-console
        console.log(`[Token Search] ✅ Found token via DexScreener: ${token.symbol} (${token.name})`);
        // eslint-disable-next-line no-console
        console.log(`[Token Search] 🖼️ Logo URL: ${token.logoURI}`);
        return NextResponse.json(token);
      }
    }

    // 2) Jupiter V2 token metadata + existence check
    // eslint-disable-next-line no-console
    console.log(`[Token Search] 🔄 No DexScreener pairs for ${query} — trying Jupiter Token API V2...`);
    const jupiter = await queryJupiterV2(query);
    if (jupiter) {
      const tokenFromJupiter = {
        address: jupiter.id ?? jupiter.address ?? query,
        name: jupiter.name ?? `Token ${query.slice(0, 8)}...`,
        symbol: jupiter.symbol ?? `TOKEN_${query.slice(0, 8)}`,
        decimals: Number(jupiter.decimals ?? 6),
        logoURI: resolveIpfs(jupiter.icon ?? jupiter.logo ?? jupiter.image),
        tags: jupiter.tags ?? [],
        verified: Boolean(jupiter.isVerified ?? jupiter.verified),
        isFromDexScreener: false,
        isJupiterFallback: true,
        daily_volume: jupiter.stats24h?.volume ?? 0,
      };

      TOKEN_SEARCH_CACHE.set(cacheKey, { data: tokenFromJupiter, timestamp: Date.now() });
      // eslint-disable-next-line no-console
      console.log(`[Token Search] ✅ Found token via Jupiter V2: ${tokenFromJupiter.symbol} (${tokenFromJupiter.name})`);
      return NextResponse.json(tokenFromJupiter);
    }

    // 3) Helius fallback (if available)
    // eslint-disable-next-line no-console
    console.log(`[Token Search] 🔄 Trying Helius fallback for ${query}...`);
    const helius = await queryHelius(query);
    if (helius) {
      const tokenFromHelius = {
        address: helius.mint ?? query,
        name: helius.metadata?.name ?? helius.name ?? `Token ${query.slice(0, 8)}...`,
        symbol: helius.metadata?.symbol ?? helius.symbol ?? `TOKEN_${query.slice(0, 8)}`,
        decimals: Number(helius.decimals ?? 6),
        logoURI: resolveIpfs(helius.metadata?.image ?? helius.image),
        tags: helius.tags ?? [],
        verified: false,
        isFromDexScreener: false,
        isHeliusFallback: true,
      };

      TOKEN_SEARCH_CACHE.set(cacheKey, { data: tokenFromHelius, timestamp: Date.now() });
      // eslint-disable-next-line no-console
      console.log(`[Token Search] ✅ Found token via Helius: ${tokenFromHelius.symbol} (${tokenFromHelius.name})`);
      return NextResponse.json(tokenFromHelius);
    }

    // Not found by any provider
    // eslint-disable-next-line no-console
    console.log(`[Token Search] ❌ No pairs or metadata found for ${query} (DexScreener, Jupiter V2, Helius all returned nothing)`);

    // Optionally: return a structured 'fallback token' indicating unknown existence
    const fallbackToken = {
      address: query,
      symbol: `TOKEN_${query.slice(0, 8)}`,
      name: `Token ${query.slice(0, 8)}...${query.slice(-4)}`,
      decimals: 6,
      logoURI: '/token-fallback.png',
      tags: ['unknown'],
      verified: false,
      isFromDexScreener: false,
      isJupiterFallback: false,
      isHeliusFallback: false,
    };

    // Cache a lightweight negative result for a short time to avoid repeated lookups
    TOKEN_SEARCH_CACHE.set(cacheKey, { data: { error: 'Token not found', fallback: fallbackToken }, timestamp: Date.now() });
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[Token Search] Error searching for ${query}:`, err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
