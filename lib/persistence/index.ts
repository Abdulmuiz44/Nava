import { JsonFileAdapter } from './json-file-adapter';
import { RunMode } from '@/lib/agent-run/types';
import { LocalPersistenceAdapter } from './local-adapter';
import { MemoryAdapter } from './memory-adapter';
import {
  StorageAdapter,
  StorageAdapterConfig,
  StorageRecord,
  DEFAULT_STORAGE_DATA_DIR,
  DEFAULT_STORAGE_FILE_NAME,
} from './storage-adapter';

export * from './storage-adapter';
export * from './json-file-adapter';
export * from './memory-adapter';
export * from './contracts';
export * from './local-adapter';

/**
 * Creates a storage adapter behind an explicit boundary so route/service code
 * can stay unchanged when moving from local files to hosted databases.
 */
export function createStorageAdapter<TRecord extends StorageRecord = StorageRecord>(
  config: StorageAdapterConfig = {}
): StorageAdapter<TRecord> {
  if (config.adapter === 'memory') {
    return new MemoryAdapter<TRecord>();
  }

  return new JsonFileAdapter<TRecord>({
    dataDirectory: config.dataDirectory ?? DEFAULT_STORAGE_DATA_DIR,
    fileName: config.fileName ?? DEFAULT_STORAGE_FILE_NAME,
  });
}

export interface PersistenceAdapterFactoryConfig {
  mode?: RunMode;
  storage?: StorageAdapterConfig;
}

/**
 * Selects persistence adapter defaults by mode while keeping a single local
 * adapter implementation for Phase 1. Hosted mode can later swap storage
 * without changing route/service code.
 */
export function createPersistenceAdapter(config: PersistenceAdapterFactoryConfig = {}) {
  const mode = config.mode ?? 'self-hosted';
  const storage = createStorageAdapter({
    ...config.storage,
    adapter: config.storage?.adapter ?? (mode === 'hosted' ? 'memory' : 'json-file'),
  });

  return new LocalPersistenceAdapter(storage);
}
