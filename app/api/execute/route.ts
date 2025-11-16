import { NextRequest, NextResponse } from 'next/server';
import { BrowserSession } from '@/lib/browser';
import { executeTask } from '@/lib/task-executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

interface ExecuteRequest {
  task: string;
  headless?: boolean;
  useBrowserUse?: boolean;
  mobile?: boolean;
}

export async function POST(request: NextRequest) {
  let session: BrowserSession | null = null;

  try {
    const body: ExecuteRequest = await request.json();
    const { task, headless = true, useBrowserUse = false, mobile = false } = body;

    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { error: 'Task is required and must be a string' },
        { status: 400 }
      );
    }

    // If Browser Use is requested, call Python API server
    if (useBrowserUse) {
      try {
        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
        const response = await fetch(`${pythonApiUrl}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task,
            headless,
            use_browser_use: true,
            mobile,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json({
            success: result.success,
            result,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Fallback to TypeScript implementation if Python API fails
          console.warn('Python API failed, falling back to TypeScript implementation');
        }
      } catch (error) {
        console.warn('Failed to connect to Python API, falling back to TypeScript implementation:', error);
      }
    }

    // Initialize browser session (Playwright)
    session = new BrowserSession({ 
      headless,
      // Note: Mobile emulation in TypeScript would need additional configuration
    });
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
