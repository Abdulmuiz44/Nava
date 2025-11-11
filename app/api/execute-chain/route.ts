import { NextRequest, NextResponse } from 'next/server';
import { BrowserSession } from '@/lib/browser';
import { executeTaskChain } from '@/lib/task-executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Maximum execution time in seconds

interface ExecuteChainRequest {
  tasks: string[];
  headless?: boolean;
  continueOnError?: boolean;
}

export async function POST(request: NextRequest) {
  let session: BrowserSession | null = null;

  try {
    const body: ExecuteChainRequest = await request.json();
    const { tasks, headless = true, continueOnError = false } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Initialize browser session
    session = new BrowserSession({ headless });
    await session.initialize();

    // Execute the task chain
    const results = await executeTaskChain(tasks, session);

    // Close browser session
    await session.close();

    const allSuccessful = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccessful,
      results,
      totalTasks: tasks.length,
      successfulTasks: results.filter(r => r.success).length,
      failedTasks: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chain execution error:', error);

    if (session) {
      try {
        await session.close();
      } catch (closeError) {
        console.error('Error closing session:', closeError);
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
