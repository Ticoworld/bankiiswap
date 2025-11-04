/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://plausible.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https: data:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  images: {
    remotePatterns: [
      // IPFS/NFT storage
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      // GitHub raw
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Hubspot CDN
      {
        protocol: 'https',
        hostname: '424565.fs1.hubspotusercontent-na1.net',
      },
      // Google Cloud (e.g. token metadata)
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Jupiter UI icons
      {
        protocol: 'https',
        hostname: 'static.jup.ag',
      },
      // General Jupiter domain wildcard
      {
        protocol: 'https',
        hostname: '**.jup.ag',
      },
      // CoinGecko token logos
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      // Arweave for decentralized storage (common in NFTs)
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
    ],
    minimumCacheTTL: 86400,
  },
  
  // 301 Redirects for deprecated routes
  async redirects() {
    return [
      {
        source: '/nfts',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/dao',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/staking',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/leaderboard',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/ecosystem',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/referrals',
        destination: '/swap',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
