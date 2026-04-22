import { canTransition, transitionRun } from './state-machine';
import { AgentRun, RunContext, RunEvent, RunMode, RunPhase, RunSnapshot, RunStatus } from './types';
import { PersistenceAdapter } from '@/lib/persistence/contracts';

export interface CreateRunInput {
  context: RunContext;
  mode?: RunMode;
  phase?: RunPhase;
  ext?: Record<string, unknown>;
}

function createRunId(): string {
  return `run_${crypto.randomUUID()}`;
}

function createEventId(): string {
  return `evt_${crypto.randomUUID()}`;
}

function createSnapshotId(): string {
  return `snap_${crypto.randomUUID()}`;
}

export class AgentRunLifecycleService {
  constructor(private readonly persistence: PersistenceAdapter) {}

  async createRun(input: CreateRunInput): Promise<AgentRun> {
    const now = new Date().toISOString();

    const run: AgentRun = {
      id: createRunId(),
      schemaVersion: 1,
      mode: input.mode ?? 'self-hosted',
      status: 'created',
      phase: input.phase ?? 'init',
      context: input.context,
      metrics: {
        attemptCount: 0,
        eventCount: 0,
        snapshotCount: 0,
      },
      ext: input.ext,
      createdAt: now,
      updatedAt: now,
    };

    const createdRun = await this.persistence.runs.create(run);
    await this.appendEvent(createdRun.id, {
      type: 'run_created',
      phase: createdRun.phase,
      payload: {
        status: createdRun.status,
        mode: createdRun.mode,
      },
    });

    return createdRun;
  }

  async startRun(runId: string, phase: RunPhase = 'execution'): Promise<AgentRun> {
    const run = await this.requireRun(runId);

    if (!canTransition(run.status, 'running')) {
      throw new Error(`Run ${runId} cannot be started from status ${run.status}.`);
    }

    const nextRun = transitionRun(
      {
        ...run,
        phase,
      },
      'running'
    );

    const updatedRun = await this.persistence.runs.update(runId, {
      ...nextRun,
      metrics: {
        ...nextRun.metrics,
        attemptCount: nextRun.metrics.attemptCount + 1,
      },
    });

    if (!updatedRun) {
      throw new Error(`Failed to start run ${runId}.`);
    }

    await this.appendEvent(runId, {
      type: 'run_started',
      phase,
    });

    return updatedRun;
  }

  async appendEvent(
    runId: string,
    input: Omit<RunEvent, 'id' | 'runId' | 'timestamp'>
  ): Promise<RunEvent> {
    await this.requireRun(runId);

    const event: RunEvent = {
      id: createEventId(),
      runId,
      type: input.type,
      phase: input.phase,
      message: input.message,
      payload: input.payload,
      timestamp: new Date().toISOString(),
    };

    const createdEvent = await this.persistence.events.append(event);
    const run = await this.requireRun(runId);

    await this.persistence.runs.update(runId, {
      metrics: {
        ...run.metrics,
        eventCount: run.metrics.eventCount + 1,
      },
    });

    return createdEvent;
  }

  async appendSnapshot(
    runId: string,
    input: Omit<RunSnapshot, 'id' | 'runId' | 'timestamp'>
  ): Promise<RunSnapshot> {
    await this.requireRun(runId);

    const snapshot: RunSnapshot = {
      id: createSnapshotId(),
      runId,
      timestamp: new Date().toISOString(),
      url: input.url,
      title: input.title,
      metadata: input.metadata,
      payload: input.payload,
    };

    const createdSnapshot = await this.persistence.snapshots.append(snapshot);
    const run = await this.requireRun(runId);

    await this.persistence.runs.update(runId, {
      metrics: {
        ...run.metrics,
        snapshotCount: run.metrics.snapshotCount + 1,
      },
    });

    return createdSnapshot;
  }

  async completeRun(runId: string, extPatch?: Record<string, unknown>): Promise<AgentRun> {
    return this.finishRun(runId, 'succeeded', undefined, extPatch);
  }

  async failRun(runId: string, error: string, extPatch?: Record<string, unknown>): Promise<AgentRun> {
    return this.finishRun(runId, 'failed', error, extPatch);
  }

  async cancelRun(runId: string, reason?: string): Promise<AgentRun> {
    const run = await this.requireRun(runId);

    if (!canTransition(run.status, 'cancelled')) {
      throw new Error(`Run ${runId} cannot be cancelled from status ${run.status}.`);
    }

    const nextRun = transitionRun(run, 'cancelled');
    const updated = await this.persistence.runs.update(runId, nextRun);

    if (!updated) {
      throw new Error(`Failed to cancel run ${runId}.`);
    }

    await this.appendEvent(runId, {
      type: 'run_cancelled',
      phase: nextRun.phase,
      message: reason,
    });

    return updated;
  }

  async getRun(runId: string): Promise<AgentRun | null> {
    return this.persistence.runs.getById(runId);
  }

  async listRuns(options: { status?: RunStatus; mode?: RunMode; limit?: number; offset?: number } = {}) {
    return this.persistence.runs.list(options);
  }

  private async finishRun(
    runId: string,
    status: 'succeeded' | 'failed',
    error?: string,
    extPatch?: Record<string, unknown>
  ): Promise<AgentRun> {
    const run = await this.requireRun(runId);

    if (!canTransition(run.status, status)) {
      throw new Error(`Run ${runId} cannot transition from ${run.status} to ${status}.`);
    }

    const transitioned = transitionRun(run, status);
    const endedAt = transitioned.completedAt ?? new Date().toISOString();
    const startedAt = transitioned.startedAt ?? transitioned.createdAt;

    const updated = await this.persistence.runs.update(runId, {
      ...transitioned,
      error,
      ext: {
        ...(transitioned.ext ?? {}),
        ...(extPatch ?? {}),
      },
      metrics: {
        ...transitioned.metrics,
        durationMs: Math.max(0, Date.parse(endedAt) - Date.parse(startedAt)),
      },
    });

    if (!updated) {
      throw new Error(`Failed to finish run ${runId}.`);
    }

    await this.appendEvent(runId, {
      type: status === 'succeeded' ? 'run_succeeded' : 'run_failed',
      phase: transitioned.phase,
      message: error,
    });

    return updated;
  }

  private async requireRun(runId: string): Promise<AgentRun> {
    const run = await this.persistence.runs.getById(runId);

    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    return run;
  }
}
