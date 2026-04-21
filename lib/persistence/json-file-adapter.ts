import fs from 'fs/promises';
import path from 'path';

import {
  DEFAULT_STORAGE_DATA_DIR,
  DEFAULT_STORAGE_FILE_NAME,
  QueryOptions,
  StorageAdapter,
  StorageCollection,
  StorageRecord,
} from './storage-adapter';

type StorageState<TRecord extends StorageRecord> = Record<StorageCollection, TRecord[]>;

interface JsonFileAdapterOptions {
  /**
   * Defaults to `<project-root>/data` via `path.resolve(process.cwd(), 'data')`.
   */
  dataDirectory?: string;
  /**
   * Defaults to `nava-storage.json`.
   */
  fileName?: string;
}

export class JsonFileAdapter<TRecord extends StorageRecord = StorageRecord>
  implements StorageAdapter<TRecord>
{
  private readonly filePath: string;

  constructor(options: JsonFileAdapterOptions = {}) {
    const baseDir = path.resolve(process.cwd(), options.dataDirectory ?? DEFAULT_STORAGE_DATA_DIR);
    const fileName = options.fileName ?? DEFAULT_STORAGE_FILE_NAME;
    this.filePath = path.join(baseDir, fileName);
  }

  async create(collection: StorageCollection, record: TRecord): Promise<TRecord> {
    const state = await this.readState();
    state[collection].push(record);
    await this.writeState(state);
    return record;
  }

  async getById(collection: StorageCollection, id: string): Promise<TRecord | null> {
    const state = await this.readState();
    return state[collection].find((record) => record.id === id) ?? null;
  }

  async update(collection: StorageCollection, id: string, patch: Partial<TRecord>): Promise<TRecord | null> {
    const state = await this.readState();
    const index = state[collection].findIndex((record) => record.id === id);

    if (index < 0) {
      return null;
    }

    const updatedRecord = {
      ...state[collection][index],
      ...patch,
    } as TRecord;

    state[collection][index] = updatedRecord;
    await this.writeState(state);

    return updatedRecord;
  }

  async delete(collection: StorageCollection, id: string): Promise<boolean> {
    const state = await this.readState();
    const beforeSize = state[collection].length;
    state[collection] = state[collection].filter((record) => record.id !== id);

    if (state[collection].length === beforeSize) {
      return false;
    }

    await this.writeState(state);
    return true;
  }

  async query(collection: StorageCollection, options: QueryOptions<TRecord> = {}): Promise<TRecord[]> {
    const state = await this.readState();
    let records = [...state[collection]];

    if (options.filter) {
      records = records.filter((record) =>
        Object.entries(options.filter ?? {}).every(([key, value]) => record[key] === value)
      );
    }

    if (options.predicate) {
      records = records.filter(options.predicate);
    }

    if (options.sortBy) {
      const direction = options.direction ?? 'asc';
      records.sort((left, right) => {
        const leftValue = left[options.sortBy!];
        const rightValue = right[options.sortBy!];

        if (leftValue === rightValue) {
          return 0;
        }

        if (leftValue == null) {
          return direction === 'asc' ? -1 : 1;
        }

        if (rightValue == null) {
          return direction === 'asc' ? 1 : -1;
        }

        if (leftValue < rightValue) {
          return direction === 'asc' ? -1 : 1;
        }

        return direction === 'asc' ? 1 : -1;
      });
    }

    const offset = options.offset ?? 0;
    const limit = options.limit ?? records.length;

    return records.slice(offset, offset + limit);
  }

  /**
   * Returns the resolved file path for observability/logging.
   */
  getStorageFilePath(): string {
    return this.filePath;
  }

  private async ensureFileExists(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.writeState(this.getEmptyState());
    }
  }

  private async readState(): Promise<StorageState<TRecord>> {
    await this.ensureFileExists();
    const content = await fs.readFile(this.filePath, 'utf-8');

    if (!content.trim()) {
      return this.getEmptyState();
    }

    const parsed = JSON.parse(content) as Partial<StorageState<TRecord>>;

    return {
      'agent-runs': parsed['agent-runs'] ?? [],
      'run-events': parsed['run-events'] ?? [],
      'api-keys': parsed['api-keys'] ?? [],
    };
  }

  private async writeState(state: StorageState<TRecord>): Promise<void> {
    const directory = path.dirname(this.filePath);
    const temporaryPath = path.join(
      directory,
      `.${path.basename(this.filePath)}.${process.pid}.${Date.now()}.tmp`
    );

    const content = JSON.stringify(state, null, 2);

    await fs.writeFile(temporaryPath, content, 'utf-8');
    await fs.rename(temporaryPath, this.filePath);
  }

  private getEmptyState(): StorageState<TRecord> {
    return {
      'agent-runs': [],
      'run-events': [],
      'api-keys': [],
    };
  }
}
