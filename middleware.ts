import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow internal key verification route without recursive auth checks.
    if (request.nextUrl.pathname === '/api/internal/auth/verify-key') {
      return NextResponse.next();
    }

    const apiKey = request.headers.get('x-api-key');
    const envApiKey = process.env.NAVA_API_KEY;
    const mode = process.env.NAVA_RUN_MODE ?? 'self-hosted';

    const envKeyRequired = Boolean(envApiKey && envApiKey !== 'none');
    const envKeyValid = envKeyRequired && Boolean(apiKey && apiKey === envApiKey);

    let repositoryKeyValid = false;
    if (apiKey) {
      try {
        const internalToken = process.env.NAVA_INTERNAL_AUTH_TOKEN ?? '';
        const verifyResponse = await fetch(`${request.nextUrl.origin}/api/internal/auth/verify-key`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-auth': internalToken,
          },
          body: JSON.stringify({ apiKey }),
        });
        if (verifyResponse.ok) {
          const payload = (await verifyResponse.json()) as { valid?: boolean };
          repositoryKeyValid = Boolean(payload.valid);
        }
      } catch {
        repositoryKeyValid = false;
      }
    }

    // Hosted mode always enforces auth, while self-hosted remains compatible.
    const requiresAuth = mode === 'hosted' || envKeyRequired;
    if (requiresAuth && !envKeyValid && !repositoryKeyValid) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Valid API key required. Provide x-api-key with env-key or repository-backed key.',
        },
        { status: 401 }
      );
    }

    // Add CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
