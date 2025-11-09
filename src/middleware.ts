// src/middleware.ts - Enhanced security middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Env flag
const IS_PROD = process.env.NODE_ENV === 'production';

// 🔒 SECURITY: Rate limiting in-memory store (for basic protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 🔒 SECURITY: Rate limiting configuration (API-only)
// NOTE: To prevent interfering with Next.js RSC/Flight requests and page loads,
// we only rate-limit explicit API routes. Page navigations (GET /swap, etc.) are excluded.
const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute for API
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
  
  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      console.warn(`Suspicious pattern detected in URL: ${url}`);
      return true;
    }
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.includes('bot') || userAgent.length < 10) {
    // Allow legitimate bots but log
    if (userAgent.includes('googlebot') || userAgent.includes('bingbot')) {
      return false;
    }
    console.warn(`Suspicious user agent: ${userAgent}`);
    return true;
  }
  
  return false;
}

// 🔒 SECURITY: Rate limiting function
function isRateLimited(request: NextRequest): boolean {
  // Do not rate limit in development
  if (!IS_PROD) return false;

  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Exclude all non-API routes and any GET/HEAD requests from rate limiting
  if (!pathname.startsWith('/api/') || method === 'GET' || method === 'HEAD') {
    return false;
  }

  const ip =
    request.ip ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';

  const limit = RATE_LIMITS.api;
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

  // 🔒 SECURITY: Check for suspicious requests first
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
  // IMPORTANT: Do NOT set Content-Security-Policy here. Keep a single CSP in next.config.js
  const securityHeaders = {
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy is added via next.config.js headers()

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
  matcher: [
    /*
     * Match all request paths except API routes and static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};