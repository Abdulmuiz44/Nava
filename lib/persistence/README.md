# Persistence Layer

This folder defines an adapter boundary for persistence so API routes and services can depend on a stable `StorageAdapter` contract instead of a specific backend implementation.

## Namespaces / Collections

The default collections are:

- `agent-runs`
- `run-events`
- `api-keys`

## Default local file behavior

When `createStorageAdapter()` is used without config, the `json-file` adapter is selected and writes to:

- data directory: `data`
- file name: `nava-storage.json`
- resolved path: `path.resolve(process.cwd(), 'data')` + `path.join(...)`

This ensures cross-platform path handling because Node's `path.resolve`/`path.join` normalize separators for Windows, macOS, and Linux.

## Atomic write pattern

The JSON adapter writes state by:

1. serializing to a temporary file in the same directory,
2. writing temp contents,
3. renaming the temp file over the target.

Renaming within the same directory provides an atomic replacement pattern on mainstream filesystems, reducing partial-write risk.

## Testing

Use `memory-adapter.ts` for in-memory tests that avoid filesystem IO.
