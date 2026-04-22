import { NextRequest, NextResponse } from 'next/server';
import { executeRunById, getRunService } from '@/lib/agent-run/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Maximum execution time in seconds

interface ExecuteChainRequest {
  tasks: string[];
  headless?: boolean;
  continueOnError?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteChainRequest = await request.json();
    const { tasks, headless = true } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required and must not be empty' },
        { status: 400 }
      );
    }

    const service = getRunService();
    const run = await service.createRun({
      context: {
        tasks,
        headless,
      },
    });

    const execution = await executeRunById(run.id);
    const results = execution.results ?? [];

    const allSuccessful = results.every(r => r.success);

    return NextResponse.json({
      success: execution.success && allSuccessful,
      results,
      totalTasks: tasks.length,
      successfulTasks: results.filter(r => r.success).length,
      failedTasks: results.filter(r => !r.success).length,
      runId: run.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chain execution error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
