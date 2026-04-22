import { AgentRun, RunEvent, RunSnapshot } from '@/lib/agent-run/types';

import { ApiKeyRecord, ApiKeyRepository, EventRepository, PersistenceAdapter, RunRepository, SnapshotRepository } from './contracts';
import { QueryOptions, StorageAdapter, StorageRecord, STORAGE_COLLECTIONS } from './storage-adapter';

type RunStorageRecord = AgentRun & StorageRecord;
type RunEventStorageRecord = RunEvent & StorageRecord;
type SnapshotStorageRecord = RunSnapshot & StorageRecord;
type ApiKeyStorageRecord = ApiKeyRecord & StorageRecord;

function toStorageRecord<T extends { id: string }>(entity: T): T & StorageRecord {
  return entity as T & StorageRecord;
}

class LocalRunRepository implements RunRepository {
  constructor(private readonly storage: StorageAdapter<RunStorageRecord>) {}

  async create(run: AgentRun): Promise<AgentRun> {
    return this.storage.create(STORAGE_COLLECTIONS.AGENT_RUNS, toStorageRecord(run));
  }

  async getById(id: string): Promise<AgentRun | null> {
    return this.storage.getById(STORAGE_COLLECTIONS.AGENT_RUNS, id);
  }

  async update(id: string, patch: Partial<AgentRun>): Promise<AgentRun | null> {
    return this.storage.update(STORAGE_COLLECTIONS.AGENT_RUNS, id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  async list(options: {
    status?: AgentRun['status'];
    mode?: AgentRun['mode'];
    limit?: number;
    offset?: number;
  } = {}): Promise<AgentRun[]> {
    const queryOptions: QueryOptions<RunStorageRecord> = {
      direction: 'desc',
      sortBy: 'createdAt',
      limit: options.limit,
      offset: options.offset,
      predicate: (record) => {
        if (options.status && record.status !== options.status) {
          return false;
        }
        if (options.mode && record.mode !== options.mode) {
          return false;
        }
        return true;
      },
    };

    return this.storage.query(STORAGE_COLLECTIONS.AGENT_RUNS, queryOptions);
  }
}

class LocalEventRepository implements EventRepository {
  constructor(private readonly storage: StorageAdapter<RunEventStorageRecord>) {}

  async append(event: RunEvent): Promise<RunEvent> {
    return this.storage.create(STORAGE_COLLECTIONS.RUN_EVENTS, toStorageRecord(event));
  }

  async listByRunId(
    runId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<RunEvent[]> {
    return this.storage.query(STORAGE_COLLECTIONS.RUN_EVENTS, {
      direction: 'asc',
      sortBy: 'timestamp',
      limit: options.limit,
      offset: options.offset,
      predicate: (record) => record.runId === runId,
    });
  }
}

class LocalSnapshotRepository implements SnapshotRepository {
  constructor(private readonly storage: StorageAdapter<SnapshotStorageRecord>) {}

  async append(snapshot: RunSnapshot): Promise<RunSnapshot> {
    return this.storage.create(STORAGE_COLLECTIONS.RUN_SNAPSHOTS, toStorageRecord(snapshot));
  }

  async listByRunId(
    runId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<RunSnapshot[]> {
    return this.storage.query(STORAGE_COLLECTIONS.RUN_SNAPSHOTS, {
      direction: 'asc',
      sortBy: 'timestamp',
      limit: options.limit,
      offset: options.offset,
      predicate: (record) => record.runId === runId,
    });
  }
}

class LocalApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly storage: StorageAdapter<ApiKeyStorageRecord>) {}

  async create(key: ApiKeyRecord): Promise<ApiKeyRecord> {
    return this.storage.create(STORAGE_COLLECTIONS.API_KEYS, toStorageRecord(key));
  }

  async getByKeyId(keyId: string): Promise<ApiKeyRecord | null> {
    const results = await this.storage.query(STORAGE_COLLECTIONS.API_KEYS, {
      limit: 1,
      predicate: (record) => record.keyId === keyId,
    });

    return results[0] ?? null;
  }

  async update(id: string, patch: Partial<ApiKeyRecord>): Promise<ApiKeyRecord | null> {
    return this.storage.update(STORAGE_COLLECTIONS.API_KEYS, id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  async list(options: { revoked?: boolean; limit?: number; offset?: number } = {}): Promise<ApiKeyRecord[]> {
    return this.storage.query(STORAGE_COLLECTIONS.API_KEYS, {
      direction: 'desc',
      sortBy: 'createdAt',
      limit: options.limit,
      offset: options.offset,
      predicate: (record) => {
        if (typeof options.revoked !== 'boolean') {
          return true;
        }

        const isRevoked = Boolean(record.revokedAt);
        return options.revoked ? isRevoked : !isRevoked;
      },
    });
  }
}

export class LocalPersistenceAdapter implements PersistenceAdapter {
  readonly runs: RunRepository;
  readonly events: EventRepository;
  readonly snapshots: SnapshotRepository;
  readonly apiKeys: ApiKeyRepository;

  constructor(storage: StorageAdapter<StorageRecord>) {
    this.runs = new LocalRunRepository(storage as StorageAdapter<RunStorageRecord>);
    this.events = new LocalEventRepository(storage as StorageAdapter<RunEventStorageRecord>);
    this.snapshots = new LocalSnapshotRepository(storage as StorageAdapter<SnapshotStorageRecord>);
    this.apiKeys = new LocalApiKeyRepository(storage as StorageAdapter<ApiKeyStorageRecord>);
  }
}
