# Nava Agentic Run Lifecycle Architecture

## 1) `AgentRun` aggregate

`AgentRun` is the durable unit of orchestration and audit.

### Core shape

```ts
interface AgentRun {
  id: string;
  tenantId?: string;       // hosted mode
  projectId?: string;      // hosted mode
  mode: 'self_hosted' | 'hosted';

  status: 'created' | 'queued' | 'running' | 'waiting' | 'succeeded' | 'failed' | 'canceled';
  phase: 'intent' | 'execute' | 'verify' | 'recover' | 'complete';

  input: {
    task?: string;
    tasks?: string[];
    headless?: boolean;
    continueOnError?: boolean;
  };

  context: {
    startedAt?: string;
    endedAt?: string;
    currentTaskIndex?: number;
    lastError?: string;
    endpointBase?: string;
  };

  metrics: {
    durationMs?: number;
    toolCalls: number;
    snapshotCount: number;
  };

  ext?: Record<string, unknown>; // extensibility field

  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}
```

### Extensibility fields

- `ext` supports safe additive metadata (planner hints, confidence metadata, policy traces).
- `schemaVersion` enables controlled migration over time.
- `phase` is future-compatible with richer engines while still useful in Phase 1.

## 2) State machine and transition matrix

### Allowed transitions

| From       | To                                           |
|------------|----------------------------------------------|
| `created`  | `queued`, `running`, `canceled`              |
| `queued`   | `running`, `canceled`, `failed`              |
| `running`  | `waiting`, `succeeded`, `failed`, `canceled` |
| `waiting`  | `running`, `failed`, `canceled`              |
| terminal (`succeeded`/`failed`/`canceled`) | _none_            |

### Transition rules

- Terminal states are immutable.
- `phase` must advance monotonically except explicit recovery loops (`recover -> execute`).
- Every transition appends an event record (`RunEvent`) for auditability.

## 3) Tool registry contracts and execution boundary

### Contracts

```ts
interface ToolInvocation {
  name: string;
  input: unknown;
  timeoutMs?: number;
}

interface ToolResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
}

interface ToolRegistry {
  register(name: string, handler: (input: unknown, ctx: ToolContext) => Promise<ToolResult>): void;
  invoke(call: ToolInvocation, ctx: ToolContext): Promise<ToolResult>;
}
```

### Execution boundary responsibilities

- Input normalization and schema validation.
- Timeout/cancellation control.
- Error isolation (tool failure does not corrupt lifecycle state writes).
- Event emission (`tool.started`, `tool.succeeded`, `tool.failed`).

## 4) Page snapshot schema and builder strategy

### Snapshot schema

```ts
interface PageSnapshot {
  id: string;
  runId: string;
  sequence: number;
  url: string;
  title?: string;
  capturedAt: string;
  viewport?: { width: number; height: number };
  domSummary?: {
    forms: number;
    links: number;
    buttons: number;
    inputs: number;
  };
  screenshotRef?: string; // path/object key, never raw binary in run row
  ext?: Record<string, unknown>;
  schemaVersion: number;
}
```

### Builder strategy

- `snapshot-builder` extracts lightweight page metadata from `BrowserSession`.
- Store screenshot as external artifact reference (file/object), not inline blob.
- Capture snapshots at deterministic points: run start, per-task boundary, run terminal.

## 5) API key security model

### Lifecycle

1. **Generate**: produce high-entropy opaque token.
2. **Store**: persist only KDF hash + key metadata (`keyId`, owner scope, createdAt).
3. **Verify**: compare presented key against stored hash.
4. **Revoke**: mark `revokedAt`, deny future use.
5. **Rotate-ready**: allow concurrent active keys per scope with expiration policy.

### Security properties

- Never return full key after creation response.
- Constant-time comparisons where applicable.
- Optional `lastUsedAt` update for audit trails.
- Compatibility mode: allow legacy `NAVA_API_KEY` fallback while migrating.

## 6) Hosted vs self-hosted mode model

### Self-hosted mode

- Minimal configuration.
- Local default persistence adapter.
- Single-tenant assumptions unless explicitly configured otherwise.

### Hosted mode

- Mandatory tenant/project scoping.
- Stronger defaults (rate limits, quotas, stricter auth policies).
- Adapter can target managed DB/object storage and centralized observability.

Mode is resolved from server configuration and influences adapter, auth, and policy behavior.

## 7) Persistence adapter abstraction

### Contracts

- `RunRepository`: CRUD + list/filter + optimistic update.
- `RunEventRepository`: append/list by run.
- `SnapshotRepository`: append/list by run/sequence.
- `ApiKeyRepository`: create/list/verify/revoke.

### Default implementation

- Phase 1 default: local adapter (file or sqlite) with atomic writes and basic indexes.
- Hosted deployments can swap adapter without changing route/service contracts.

## 8) Lifecycle/API route contracts

### New lifecycle routes

- `POST /api/runs`
  - Create run in `created` state.
- `POST /api/runs/:runId/start`
  - Transition to `running`, execute, emit events/snapshots, finalize terminal state.
- `GET /api/runs/:runId`
  - Fetch run aggregate + optional projections.
- `GET /api/runs`
  - List runs with basic filters (status/date/mode).
- `POST /api/runs/:runId/cancel`
  - Best-effort cancellation and terminal transition.

### Legacy compatibility routes

- `POST /api/execute`
- `POST /api/execute-chain`

These become compatibility wrappers that internally call lifecycle services.

## 9) Integration points for future planner/verifier/recovery/confidence phases

- `phase` field in `AgentRun` supports non-breaking introduction of:
  - Planner intent decomposition.
  - Verifier post-step checks.
  - Recovery branch execution.
  - Confidence scoring and policy gates.
- Event taxonomy already supports phase-specific events (`planner.*`, `verify.*`, `recover.*`).
- `ext` can hold per-phase payloads without schema churn.

## 10) CLI alignment hooks

- CLI should read `NAVA_API_KEY` and send `x-api-key` consistently.
- CLI endpoint selection must support local (`http://localhost:3000`) and hosted base URLs.
- Preferred flow:
  1. `POST /api/runs` (create)
  2. `POST /api/runs/:runId/start` (execute)
  3. `GET /api/runs/:runId` (poll/final state)
- Compatibility fallback to legacy `/api/execute*` during migration.

This preserves current CLI behavior while enabling gradual adoption of the lifecycle architecture.
