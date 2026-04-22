import { NextRequest, NextResponse } from 'next/server';
import { getRunService } from '@/lib/agent-run/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const service = getRunService();
    const run = await service.getRun(params.runId);

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, run });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get run',
      },
      { status: 500 }
    );
  }
}
