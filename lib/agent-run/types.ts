export const RUN_MODES = ['self-hosted', 'hosted'] as const;
export type RunMode = (typeof RUN_MODES)[number];

export const RUN_STATUSES = [
  'created',
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const RUN_PHASES = [
  'init',
  'planning',
  'execution',
  'verification',
  'recovery',
  'finalization',
] as const;
export type RunPhase = (typeof RUN_PHASES)[number];

export interface RunContext {
  [key: string]: unknown;
  task?: string;
  tasks?: string[];
  headless?: boolean;
  initiatedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface RunMetrics {
  durationMs?: number;
  attemptCount: number;
  eventCount: number;
  snapshotCount: number;
}

export type RunExt = Record<string, unknown>;

export interface AgentRun {
  id: string;
  schemaVersion: number;
  mode: RunMode;
  status: RunStatus;
  phase: RunPhase;
  context: RunContext;
  metrics: RunMetrics;
  ext?: RunExt;
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface RunEvent {
  id: string;
  runId: string;
  type: string;
  timestamp: string;
  phase?: RunPhase;
  message?: string;
  payload?: Record<string, unknown>;
}

export interface RunSnapshot {
  id: string;
  runId: string;
  timestamp: string;
  url?: string;
  title?: string;
  metadata?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}
