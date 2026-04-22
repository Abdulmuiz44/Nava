import { NextRequest, NextResponse } from 'next/server';
import { getRunService } from '@/lib/agent-run/runtime';
import { RunMode, RUN_MODES, RUN_STATUSES, RunStatus } from '@/lib/agent-run/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateRunRequest {
  task?: string;
  tasks?: string[];
  headless?: boolean;
  mode?: RunMode;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRunRequest;
    const task = typeof body.task === 'string' ? body.task.trim() : undefined;
    const tasks = Array.isArray(body.tasks)
      ? body.tasks.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      : undefined;

    if (!task && (!tasks || tasks.length === 0)) {
      return NextResponse.json(
        { error: 'Either task or tasks[] is required.' },
        { status: 400 }
      );
    }

    const service = getRunService();
    const run = await service.createRun({
      mode: body.mode ?? 'self-hosted',
      context: {
        task,
        tasks,
        headless: body.headless ?? true,
        metadata: body.metadata,
      },
    });

    return NextResponse.json({ success: true, run }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create run',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const mode = searchParams.get('mode') as RunMode | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const parsedStatus =
      status && (RUN_STATUSES as readonly string[]).includes(status)
        ? (status as RunStatus)
        : undefined;
    const parsedMode =
      mode && (RUN_MODES as readonly string[]).includes(mode)
        ? mode
        : undefined;

    const service = getRunService();
    const runs = await service.listRuns({
      status: parsedStatus,
      mode: parsedMode,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ success: true, runs });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list runs',
      },
      { status: 500 }
    );
  }
}
