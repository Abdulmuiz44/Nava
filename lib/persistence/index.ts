import { JsonFileAdapter } from './json-file-adapter';
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
