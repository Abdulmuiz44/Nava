export const AGENT_RUN_STATUSES = [
  'queued',
  'planning',
  'running',
  'waiting_for_approval',
  'succeeded',
  'failed',
  'cancelled',
] as const;

export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number];

export interface AgentRunPlanStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  detail?: string;
}

export interface AgentRunPageStateSnapshot {
  id: string;
  capturedAt: string;
  url?: string;
  title?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentRunAction {
  id: string;
  at: string;
  type: string;
  input?: unknown;
  output?: unknown;
  success?: boolean;
  error?: string;
}

export interface AgentRunTimestamps {
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface AgentRun {
  id: string;
  goal: string;
  status: AgentRunStatus;
  currentStep: number;
  plan: AgentRunPlanStep[];
  pageStateSnapshots: AgentRunPageStateSnapshot[];
  actionHistory: AgentRunAction[];
  timestamps: AgentRunTimestamps;

  userId?: string;
  sessionId?: string;
  constraints?: string[];
  finalOutput?: string;
  error?: string;

  verifierState?: Record<string, unknown>;
  confidenceState?: Record<string, unknown>;
  recoveryState?: Record<string, unknown>;
  approvalsState?: Record<string, unknown>;
  memoryRefs?: string[];
}

export interface CreateAgentRunInput {
  id: string;
  goal: string;
  status?: AgentRunStatus;
  currentStep?: number;
  plan?: AgentRunPlanStep[];
  pageStateSnapshots?: AgentRunPageStateSnapshot[];
  actionHistory?: AgentRunAction[];
  timestamps?: Partial<AgentRunTimestamps>;

  userId?: string;
  sessionId?: string;
  constraints?: string[];
  finalOutput?: string;
  error?: string;

  verifierState?: Record<string, unknown>;
  confidenceState?: Record<string, unknown>;
  recoveryState?: Record<string, unknown>;
  approvalsState?: Record<string, unknown>;
  memoryRefs?: string[];
}

export type AgentRunUpdatePayload = Partial<
  Omit<AgentRun, 'id' | 'timestamps'>
> & {
  timestamps?: Partial<AgentRunTimestamps>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isAgentRunStatus = (value: unknown): value is AgentRunStatus =>
  typeof value === 'string' &&
  (AGENT_RUN_STATUSES as readonly string[]).includes(value);

const isIsoDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

export const isAgentRunUpdatePayload = (
  value: unknown,
): value is AgentRunUpdatePayload => {
  if (!isRecord(value)) {
    return false;
  }

  if ('status' in value && !isAgentRunStatus(value.status)) {
    return false;
  }

  if ('currentStep' in value && typeof value.currentStep !== 'number') {
    return false;
  }

  if ('timestamps' in value) {
    if (!isRecord(value.timestamps)) {
      return false;
    }

    const { createdAt, updatedAt, startedAt, completedAt, cancelledAt } =
      value.timestamps;

    if (createdAt !== undefined && !isIsoDateString(createdAt)) return false;
    if (updatedAt !== undefined && !isIsoDateString(updatedAt)) return false;
    if (startedAt !== undefined && !isIsoDateString(startedAt)) return false;
    if (completedAt !== undefined && !isIsoDateString(completedAt))
      return false;
    if (cancelledAt !== undefined && !isIsoDateString(cancelledAt))
      return false;
  }

  return true;
};

export const isAgentRun = (value: unknown): value is AgentRun => {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredScalarFields =
    typeof value.id === 'string' &&
    typeof value.goal === 'string' &&
    isAgentRunStatus(value.status) &&
    typeof value.currentStep === 'number';

  if (!hasRequiredScalarFields) {
    return false;
  }

  if (!Array.isArray(value.plan)) return false;
  if (!Array.isArray(value.pageStateSnapshots)) return false;
  if (!Array.isArray(value.actionHistory)) return false;

  if (!isRecord(value.timestamps)) {
    return false;
  }

  if (
    !isIsoDateString(value.timestamps.createdAt) ||
    !isIsoDateString(value.timestamps.updatedAt)
  ) {
    return false;
  }

  if (
    value.timestamps.startedAt !== undefined &&
    !isIsoDateString(value.timestamps.startedAt)
  ) {
    return false;
  }

  if (
    value.timestamps.completedAt !== undefined &&
    !isIsoDateString(value.timestamps.completedAt)
  ) {
    return false;
  }

  if (
    value.timestamps.cancelledAt !== undefined &&
    !isIsoDateString(value.timestamps.cancelledAt)
  ) {
    return false;
  }

  return true;
};

export const createAgentRun = (input: CreateAgentRunInput): AgentRun => {
  const now = new Date().toISOString();

  return {
    id: input.id,
    goal: input.goal,
    status: input.status ?? 'queued',
    currentStep: input.currentStep ?? 0,
    plan: input.plan ?? [],
    pageStateSnapshots: input.pageStateSnapshots ?? [],
    actionHistory: input.actionHistory ?? [],
    timestamps: {
      createdAt: input.timestamps?.createdAt ?? now,
      updatedAt: input.timestamps?.updatedAt ?? now,
      startedAt: input.timestamps?.startedAt,
      completedAt: input.timestamps?.completedAt,
      cancelledAt: input.timestamps?.cancelledAt,
    },

    userId: input.userId,
    sessionId: input.sessionId,
    constraints: input.constraints,
    finalOutput: input.finalOutput,
    error: input.error,

    verifierState: input.verifierState,
    confidenceState: input.confidenceState,
    recoveryState: input.recoveryState,
    approvalsState: input.approvalsState,
    memoryRefs: input.memoryRefs,
  };
};

export const applyAgentRunUpdate = (
  run: AgentRun,
  update: AgentRunUpdatePayload,
): AgentRun => {
  if (!isAgentRunUpdatePayload(update)) {
    throw new Error('Invalid AgentRun update payload');
  }

  return {
    ...run,
    ...update,
    timestamps: {
      ...run.timestamps,
      ...(update.timestamps ?? {}),
      updatedAt: update.timestamps?.updatedAt ?? new Date().toISOString(),
    },
  };
};
