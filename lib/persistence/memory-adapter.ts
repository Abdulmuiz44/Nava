import {
  QueryOptions,
  StorageAdapter,
  StorageCollection,
  StorageRecord,
} from './storage-adapter';

type StorageState<TRecord extends StorageRecord> = Record<StorageCollection, TRecord[]>;

export class MemoryAdapter<TRecord extends StorageRecord = StorageRecord>
  implements StorageAdapter<TRecord>
{
  private state: StorageState<TRecord> = {
    'agent-runs': [],
    'run-events': [],
    'api-keys': [],
  };

  async create(collection: StorageCollection, record: TRecord): Promise<TRecord> {
    this.state[collection].push(record);
    return record;
  }

  async getById(collection: StorageCollection, id: string): Promise<TRecord | null> {
    return this.state[collection].find((record) => record.id === id) ?? null;
  }

  async update(collection: StorageCollection, id: string, patch: Partial<TRecord>): Promise<TRecord | null> {
    const index = this.state[collection].findIndex((record) => record.id === id);

    if (index < 0) {
      return null;
    }

    const updatedRecord = {
      ...this.state[collection][index],
      ...patch,
    } as TRecord;

    this.state[collection][index] = updatedRecord;

    return updatedRecord;
  }

  async delete(collection: StorageCollection, id: string): Promise<boolean> {
    const beforeSize = this.state[collection].length;
    this.state[collection] = this.state[collection].filter((record) => record.id !== id);
    return beforeSize !== this.state[collection].length;
  }

  async query(collection: StorageCollection, options: QueryOptions<TRecord> = {}): Promise<TRecord[]> {
    let records = [...this.state[collection]];

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

  clear(): void {
    this.state = {
      'agent-runs': [],
      'run-events': [],
      'api-keys': [],
    };
  }
}
