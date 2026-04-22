import { NextRequest, NextResponse } from 'next/server';
import { getRunService } from '@/lib/agent-run/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CancelRunRequest {
  reason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const body = (await request.json().catch(() => ({}))) as CancelRunRequest;
    const service = getRunService();
    const run = await service.cancelRun(params.runId, body.reason);

    return NextResponse.json({
      success: true,
      run,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel run';
    const status = message.includes('not found') ? 404 : 400;

    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
