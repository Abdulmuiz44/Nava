import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');
    const envApiKey = process.env.NAVA_API_KEY;

    // If API key is configured, validate it
    if (envApiKey && envApiKey !== 'none') {
      if (!apiKey || apiKey !== envApiKey) {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'Valid API key required. Add x-api-key header or configure NAVA_API_KEY in environment.' 
          },
          { status: 401 }
        );
      }
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
