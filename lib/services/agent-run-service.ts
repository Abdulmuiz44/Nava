import { AgentEvent, AgentEventName, AgentEventPayloads, AgentRunEvent } from '@/lib/domain/agent-events';

export type AgentRunStatus = 'created' | 'planning' | 'executing' | 'succeeded' | 'failed' | 'cancelled';

export interface AgentRun {
  id: string;
  task: string;
  status: AgentRunStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  timeline: AgentRunEvent[];
}

export interface CreateRunInput {
  task: string;
  metadata?: Record<string, unknown>;
}

export interface ListRunsOptions {
  status?: AgentRunStatus;
  limit?: number;
  offset?: number;
}

const ALLOWED_STATUS_TRANSITIONS: Record<AgentRunStatus, readonly AgentRunStatus[]> = {
  created: ['planning', 'cancelled', 'failed'],
  planning: ['executing', 'cancelled', 'failed'],
  executing: ['succeeded', 'failed', 'cancelled'],
  succeeded: [],
  failed: [],
  cancelled: [],
};

const TERMINAL_STATUSES: ReadonlySet<AgentRunStatus> = new Set(['succeeded', 'failed', 'cancelled']);

class AgentRunService {
  private readonly runs = new Map<string, AgentRun>();
  private readonly eventsByRunId = new Map<string, AgentRunEvent[]>();

  createRun(input: CreateRunInput): AgentRun {
    const now = new Date().toISOString();
    const run: AgentRun = {
      id: this.generateRunId(),
      task: input.task,
      metadata: input.metadata,
      status: 'created',
      createdAt: now,
      updatedAt: now,
      timeline: [],
    };

    this.runs.set(run.id, run);
    this.eventsByRunId.set(run.id, []);

    this.recordEvent(run.id, 'run_created', { status: run.status });

    return this.getRunOrThrow(run.id);
  }

  transitionRunStatus(runId: string, nextStatus: AgentRunStatus): AgentRun {
    const run = this.getRunOrThrow(runId);

    if (run.status === nextStatus) {
      return this.cloneRun(run);
    }

    const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[run.status];
    if (!allowedStatuses.includes(nextStatus)) {
      const allowedDescription = allowedStatuses.length > 0
        ? allowedStatuses.join(', ')
        : 'no further transitions';

      throw new Error(
        `Invalid status transition for run ${runId}: ${run.status} -> ${nextStatus}. Allowed: ${allowedDescription}.`,
      );
    }

    run.status = nextStatus;
    run.updatedAt = new Date().toISOString();

    this.runs.set(runId, run);

    return this.cloneRun(run);
  }

  recordEvent<TName extends AgentEventName>(
    runId: string,
    eventName: TName,
    payload: AgentEventPayloads[TName],
  ): AgentEvent<TName> {
    const run = this.getRunOrThrow(runId);

    const event: AgentEvent<TName> = {
      id: this.generateEventId(),
      runId,
      name: eventName,
      timestamp: new Date().toISOString(),
      payload,
    };

    const runEvents = this.eventsByRunId.get(runId) ?? [];
    runEvents.push(event as AgentRunEvent);
    this.eventsByRunId.set(runId, runEvents);

    run.timeline.push(event as AgentRunEvent);
    run.updatedAt = event.timestamp;
    this.runs.set(runId, run);

    return event;
  }

  getRun(runId: string): AgentRun | null {
    const run = this.runs.get(runId);
    return run ? this.cloneRun(run) : null;
  }

  listRuns(options: ListRunsOptions = {}): AgentRun[] {
    const { status, limit, offset = 0 } = options;
    const runs = Array.from(this.runs.values())
      .filter(run => (status ? run.status === status : true))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    const paginatedRuns = typeof limit === 'number'
      ? runs.slice(offset, offset + limit)
      : runs.slice(offset);

    return paginatedRuns.map(run => this.cloneRun(run));
  }

  cancelRun(runId: string, reason?: string): AgentRun {
    const run = this.getRunOrThrow(runId);

    if (TERMINAL_STATUSES.has(run.status)) {
      if (run.status === 'cancelled') {
        return this.cloneRun(run);
      }

      throw new Error(`Cannot cancel run ${runId} because it is already ${run.status}.`);
    }

    const updatedRun = this.transitionRunStatus(runId, 'cancelled');
    this.recordEvent(runId, 'run_cancelled', { reason });

    return updatedRun;
  }

  private getRunOrThrow(runId: string): AgentRun {
    const run = this.runs.get(runId);

    if (!run) {
      throw new Error(`Run not found: ${runId}.`);
    }

    return run;
  }

  private cloneRun(run: AgentRun): AgentRun {
    return {
      ...run,
      timeline: [...run.timeline],
    };
  }

  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

const agentRunService = new AgentRunService();

export {
  ALLOWED_STATUS_TRANSITIONS,
  agentRunService,
};
