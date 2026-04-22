import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKeyFromRepository } from '@/lib/security/api-keys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VerifyKeyRequest {
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.NAVA_INTERNAL_AUTH_TOKEN;
    const providedToken = request.headers.get('x-internal-auth');

    if (expectedToken && providedToken !== expectedToken) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const body = (await request.json()) as VerifyKeyRequest;
    if (!body.apiKey || typeof body.apiKey !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const keyRecord = await verifyApiKeyFromRepository(body.apiKey);
    return NextResponse.json({ valid: Boolean(keyRecord) });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
