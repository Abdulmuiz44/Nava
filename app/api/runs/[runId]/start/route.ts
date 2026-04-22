import { NextRequest, NextResponse } from 'next/server';
import { executeRunById, getRunService } from '@/lib/agent-run/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const service = getRunService();
    const existing = await service.getRun(params.runId);

    if (!existing) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const execution = await executeRunById(params.runId);
    const run = await service.getRun(params.runId);

    return NextResponse.json({
      success: execution.success,
      run,
      result: execution.result,
      results: execution.results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start run',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
