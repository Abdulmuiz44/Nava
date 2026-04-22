import { AgentRun, RunStatus } from './types';

const ALLOWED_TRANSITIONS: Record<RunStatus, readonly RunStatus[]> = {
  created: ['queued', 'running', 'cancelled', 'failed'],
  queued: ['running', 'cancelled', 'failed'],
  running: ['succeeded', 'failed', 'cancelled'],
  succeeded: [],
  failed: [],
  cancelled: [],
};

const TERMINAL_STATUSES = new Set<RunStatus>(['succeeded', 'failed', 'cancelled']);

export function canTransition(from: RunStatus, to: RunStatus): boolean {
  if (from === to) {
    return true;
  }

  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function transitionRun(run: AgentRun, to: RunStatus): AgentRun {
  if (!canTransition(run.status, to)) {
    throw new Error(`Invalid run transition: ${run.status} -> ${to}`);
  }

  const now = new Date().toISOString();
  const nextRun: AgentRun = {
    ...run,
    status: to,
    updatedAt: now,
  };

  if (to === 'running' && !nextRun.startedAt) {
    nextRun.startedAt = now;
  }

  if (to === 'cancelled') {
    nextRun.cancelledAt = now;
  }

  if (TERMINAL_STATUSES.has(to)) {
    nextRun.completedAt = now;
  }

  return nextRun;
}

export { ALLOWED_TRANSITIONS, TERMINAL_STATUSES };
