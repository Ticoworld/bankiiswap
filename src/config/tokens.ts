export const BKP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BKP_TOKEN_ADDRESS || 'C1MAQ3hbSVR6d5isBRRcBAJKnPrbVwfajDhiNLhJNrff';

export type Token = {
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
  price?: number;
  verified?: boolean; // Jupiter strict list verification
  tags?: string[]; // Jupiter tags (community, verified, etc.)
  isFromDexScreener?: boolean; // Flag for tokens from DexScreener (unverified)
  isJupiterFallback?: boolean; // Flag for tokens found via Jupiter fallback but not in verified lists
}; 

export const BKP_TOKEN: Token = {
  address: BKP_TOKEN_ADDRESS,
  name: 'Bankii Token',
  symbol: 'BKP',
  logoURI: '/assets/tokens/bkp.png',
  decimals: 9,  // Update to correct decimals for BKP
  verified: true,
  tags: ['utility', 'verified']
};

export const SOL_TOKEN: Token = {
  address: 'So11111111111111111111111111111111111111112',
  name: 'Solana',
  symbol: 'SOL',
  logoURI: '/assets/tokens/sol.png',
  decimals: 9,
  verified: true,
};

export const USDC_TOKEN: Token = {
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: '/assets/tokens/usdc.png',
  decimals: 6,
  verified: true,
};

// Default swap pair: USDC → BKP
export const DEFAULT_INPUT_TOKEN = USDC_TOKEN;
export const DEFAULT_OUTPUT_TOKEN = BKP_TOKEN;

