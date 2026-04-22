import { NextRequest, NextResponse } from 'next/server';
import { executeRunById, getRunService } from '@/lib/agent-run/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

interface ExecuteRequest {
  task: string;
  headless?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { task, headless = true } = body;

    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { error: 'Task is required and must be a string' },
        { status: 400 }
      );
    }

    const service = getRunService();
    const run = await service.createRun({
      context: {
        task,
        headless,
      },
    });

    const execution = await executeRunById(run.id);
    const result = execution.result;

    return NextResponse.json({
      success: execution.success,
      result,
      runId: run.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Execution error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
