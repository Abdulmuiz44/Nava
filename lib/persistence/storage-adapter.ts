export const STORAGE_COLLECTIONS = {
  AGENT_RUNS: 'agent-runs',
  RUN_EVENTS: 'run-events',
  RUN_SNAPSHOTS: 'run-snapshots',
  API_KEYS: 'api-keys',
} as const;

export type StorageCollection = typeof STORAGE_COLLECTIONS[keyof typeof STORAGE_COLLECTIONS];

export type StoragePrimitive = string | number | boolean | null;

export type StorageValue =
  | StoragePrimitive
  | StorageValue[]
  | { [key: string]: unknown };

export type StorageRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: StorageValue | undefined;
};

export type QueryDirection = 'asc' | 'desc';

export interface QueryOptions<TRecord extends StorageRecord = StorageRecord> {
  filter?: Partial<TRecord>;
  predicate?: (record: TRecord) => boolean;
  sortBy?: keyof TRecord;
  direction?: QueryDirection;
  limit?: number;
  offset?: number;
}

export interface StorageAdapter<TRecord extends StorageRecord = StorageRecord> {
  create(collection: StorageCollection, record: TRecord): Promise<TRecord>;
  getById(collection: StorageCollection, id: string): Promise<TRecord | null>;
  update(
    collection: StorageCollection,
    id: string,
    patch: Partial<TRecord>
  ): Promise<TRecord | null>;
  delete(collection: StorageCollection, id: string): Promise<boolean>;
  query(collection: StorageCollection, options?: QueryOptions<TRecord>): Promise<TRecord[]>;
}

export interface StorageAdapterConfig {
  adapter?: 'json-file' | 'memory';
  dataDirectory?: string;
  fileName?: string;
}

export const DEFAULT_STORAGE_DATA_DIR = 'data';
export const DEFAULT_STORAGE_FILE_NAME = 'nava-storage.json';
