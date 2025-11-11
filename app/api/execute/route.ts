import { NextRequest, NextResponse } from 'next/server';
import { BrowserSession } from '@/lib/browser';
import { executeTask } from '@/lib/task-executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

interface ExecuteRequest {
  task: string;
  headless?: boolean;
}

export async function POST(request: NextRequest) {
  let session: BrowserSession | null = null;

  try {
    const body: ExecuteRequest = await request.json();
    const { task, headless = true } = body;

    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { error: 'Task is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize browser session
    session = new BrowserSession({ headless });
    await session.initialize();

    // Execute the task
    const result = await executeTask(task, session);

    // Close browser session
    await session.close();

    return NextResponse.json({
      success: result.success,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Execution error:', error);

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
