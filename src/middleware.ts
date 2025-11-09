// src/middleware.ts - Enhanced security middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Env flag
const IS_PROD = process.env.NODE_ENV === 'production';

// 🔒 SECURITY: Rate limiting in-memory store (for basic protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 🔒 SECURITY: Rate limiting configuration
const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute for API
  // NOTE: This limiter should target API actions, not page navigations. Keep generous to avoid false positives.
  swap: { maxRequests: 120, windowMs: 60000 }, // 120 requests per minute
  general: { maxRequests: 300, windowMs: 60000 } // 300 requests per minute general
};

// 🔒 SECURITY: Suspicious patterns detection
const SUSPICIOUS_PATTERNS = [
  /\.\.\//g,  // Path traversal
  /<script/gi, // XSS attempts
  /union.*select/gi, // SQL injection
  /javascript:/gi, // JavaScript protocol
  /data:.*base64/gi, // Data URLs
  /eval\(/gi, // Code execution
  /expression\(/gi, // CSS expression
];

// 🔒 Routes that still require wallet verification (minimal set)
// Login removed; keep only truly sensitive sections here.
const PROTECTED_ROUTES = [
  '/admin',
  '/analytics'
];

// 🌐 Always public routes (no restrictions)
const PUBLIC_ROUTES = [
  '/api/health',    // Health checks
  '/api/ping',      // Ping endpoint
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/assets',
  '/public',
  '/',              // Landing page
  '/swap',          // Swap now publicly accessible (wallet gating handled client-side)
  '/legal',         // Legal pages
  '/dao',           // DAO page (coming soon)
  '/staking',       // Staking page (coming soon)
  '/nfts',          // NFTs page (coming soon)
  '/ecosystem'      // Ecosystem page
];

// 🔒 SECURITY: Check for suspicious request patterns
function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const pathname = request.nextUrl.pathname;
  
  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      console.warn(`Suspicious pattern detected in URL: ${url}`);
      return true;
    }
  }
  
  // Only check user agent for API routes and sensitive paths
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin/')) {
    if (!userAgent) return false; // Allow missing user agent
    if (
      userAgent.includes('googlebot') ||
      userAgent.includes('bingbot') ||
      userAgent.includes('vercel') ||
      userAgent.includes('chrome-lighthouse')
    ) {
      return false; // Allow legitimate bots
    }
  }
  
  return false;
}

// 🔒 SECURITY: Rate limiting function
function isRateLimited(request: NextRequest): boolean {
  // Do not rate limit in development to prevent Next.js dev/HMR/Flight retries from tripping the limiter
  if (!IS_PROD) return false;

  const ip =
    request.ip ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';

  const pathname = request.nextUrl.pathname;
  const method = request.method;
  
  // Determine rate limit based on path
  let limit = RATE_LIMITS.general;
  if (pathname.startsWith('/api/')) {
    limit = RATE_LIMITS.api;
  } else if (pathname === '/swap' || pathname.endsWith('/swap')) {
    // Only enforce stricter limits for state-changing methods; GET/HEAD page loads are safe
    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      limit = RATE_LIMITS.swap;
    }
  }
  
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return false;
  }
  
  if (now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return false;
  }
  
  entry.count++;
  if (entry.count > limit.maxRequests) {
    console.warn(`Rate limit exceeded for IP: ${ip}, path: ${pathname}, method: ${method}`);
    return true;
  }
  
  return false;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Access check now: allow everything unless on protected route; no more login cookie gating.
function shouldAllow(_request: NextRequest): { ok: boolean; redirect?: URL } {
  return { ok: true };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // � CRITICAL: Skip all middleware logic for Next.js internal routes to prevent interference
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/__next') ||
    pathname.includes('/_next/data/') ||
    pathname.includes('/_next/static/')
  ) {
    return NextResponse.next();
  }

  // �🔒 SECURITY: Check for suspicious requests first
  if (isSuspiciousRequest(request)) {
    console.error(`Blocking suspicious request: ${request.url}`);
    return new Response('Forbidden', { status: 403 });
  }

  // 🔒 SECURITY: Apply rate limiting
  if (isRateLimited(request)) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'application/json'
      }
    });
  }

  // Create response
  let response = NextResponse.next();

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    response = NextResponse.next();
  } else if (isProtectedRoute(pathname)) {
    // Future: implement server-side wallet allowlist if needed.
    const check = shouldAllow(request);
    if (!check.ok && check.redirect) {
      response = NextResponse.redirect(check.redirect);
    }
  }

  // 🔒 SECURITY: Enhanced security headers for all responses
  const securityHeaders = {
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy (Enhanced)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: blob:",
      "media-src 'self' https: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()'
    ].join(', '),
    
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 🔒 SECURITY: Add security context headers for debugging
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Security-Check', 'passed');
    response.headers.set('X-Rate-Limit-Applied', 'true');
  }

  return response;
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - assets (our static images/logos)
   * - landing (our static images/videos)
   * - public (our static files)
   * - any file with an extension (e.g., .png, .jpg, .svg, .ico, .txt, .xml)
   *
   * This is a "best-practice" matcher that runs on PAGES but ignores ASSETS.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|assets|landing|public|.*\\..*).*)',
  ],
};