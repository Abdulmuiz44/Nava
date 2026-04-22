import { AgentRun, RunEvent, RunMode, RunSnapshot, RunStatus } from '@/lib/agent-run/types';

export interface ApiKeyRecord {
  id: string;
  keyId: string;
  keyHash: string;
  ownerId?: string;
  label?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ListRunsOptions {
  status?: RunStatus;
  mode?: RunMode;
  limit?: number;
  offset?: number;
}

export interface RunRepository {
  create(run: AgentRun): Promise<AgentRun>;
  getById(id: string): Promise<AgentRun | null>;
  update(id: string, patch: Partial<AgentRun>): Promise<AgentRun | null>;
  list(options?: ListRunsOptions): Promise<AgentRun[]>;
}

export interface EventRepository {
  append(event: RunEvent): Promise<RunEvent>;
  listByRunId(runId: string, options?: { limit?: number; offset?: number }): Promise<RunEvent[]>;
}

export interface SnapshotRepository {
  append(snapshot: RunSnapshot): Promise<RunSnapshot>;
  listByRunId(runId: string, options?: { limit?: number; offset?: number }): Promise<RunSnapshot[]>;
}

export interface ApiKeyRepository {
  create(key: ApiKeyRecord): Promise<ApiKeyRecord>;
  getByKeyId(keyId: string): Promise<ApiKeyRecord | null>;
  update(id: string, patch: Partial<ApiKeyRecord>): Promise<ApiKeyRecord | null>;
  list(options?: { revoked?: boolean; limit?: number; offset?: number }): Promise<ApiKeyRecord[]>;
}

export interface PersistenceAdapter {
  runs: RunRepository;
  events: EventRepository;
  snapshots: SnapshotRepository;
  apiKeys: ApiKeyRepository;
}
