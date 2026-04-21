# Nava Agentic Run Lifecycle Plan

## 1) Current-state summary

Nava currently executes automation in a **single request/session boundary**:

- `POST /api/execute` creates a fresh `BrowserSession`, runs one parsed task, and closes the session immediately.
- `POST /api/execute-chain` creates a fresh `BrowserSession`, runs an in-memory list of tasks, and closes the session at the end of the request.
- There is **no durable run lifecycle** (no persisted run IDs, resumable states, or event history).
- Workflow and screenshot behavior is partly file/local-storage based, not lifecycle-centric.
- API authentication is implemented as **env-key middleware** (`NAVA_API_KEY` + `x-api-key` equality check), without key-domain entities (owner, metadata, revocation, rotation).

Operationally, this yields low complexity but prevents durable orchestration, hosted multi-tenant controls, and richer agent phases.

## 2) Target-state summary

Nava evolves to an **agentic run lifecycle architecture** with:

- A first-class `AgentRun` domain aggregate and explicit state machine.
- Durable storage abstraction (`RunRepository`, `EventRepository`, `SnapshotRepository`, `ApiKeyRepository`) with a default local implementation and pluggable hosted backends.
- A dedicated API key domain (generate, hash, verify, revoke; rotation-ready semantics).
- Mode-aware operation:
  - **Self-hosted mode**: simple local persistence and single-tenant assumptions.
  - **Hosted mode**: organization/project scoping, stricter quotas/isolation, lifecycle observability.
- Stable run APIs (`create/start/get/list/cancel`) used by web and CLI clients.

## 3) Phased roadmap

### Phase 1 — Lifecycle foundation (must-ship)
Establish durable run lifecycle primitives, key domain, and mode model without full planner/verifier engines.

### Phase 2 — Operational hardening + richer orchestration
Add retries, resumability controls, event streaming, pagination/filters, and richer execution telemetry.

### Phase 3+ — Advanced agentic intelligence
Introduce planner/verifier/recovery/confidence execution phases and optional policy-driven autonomy.

## 4) Exact Phase 1 deliverables mapped to code modules/routes

### 4.1 Domain + persistence contracts
- Add `lib/agent-run/types.ts`
  - `AgentRun`, `RunStatus`, `RunPhase`, `RunMode`, `RunContext`, `RunMetrics`, `RunExt`.
- Add `lib/agent-run/state-machine.ts`
  - Transition guards and transition helper (`canTransition`, `transitionRun`).
- Add `lib/persistence/contracts.ts`
  - Repository interfaces for runs/events/snapshots/api-keys.
- Add `lib/persistence/local-adapter.ts`
  - Default file-based (or sqlite) implementation for self-hosted mode.
- Add `lib/persistence/index.ts`
  - Adapter factory by mode (`hosted` vs `self-hosted`).

### 4.2 Run service + execution boundary
- Add `lib/agent-run/service.ts`
  - `createRun`, `startRun`, `appendEvent`, `completeRun`, `failRun`, `cancelRun`, `getRun`.
- Add `lib/agent-run/tool-registry.ts`
  - Tool contract + registration + invocation boundary wrappers.
- Add `lib/agent-run/snapshot-builder.ts`
  - Produces normalized page snapshot payloads from `BrowserSession` state.
- Integrate with `lib/task-executor.ts`
  - Keep task parsing/execution logic, but invoke via lifecycle service context.

### 4.3 API routes (new + adapted)
- Add `app/api/runs/route.ts`
  - `POST /api/runs` (create run), `GET /api/runs` (list runs).
- Add `app/api/runs/[runId]/route.ts`
  - `GET /api/runs/:runId`.
- Add `app/api/runs/[runId]/start/route.ts`
  - `POST /api/runs/:runId/start`.
- Add `app/api/runs/[runId]/cancel/route.ts`
  - `POST /api/runs/:runId/cancel`.
- Adapt `app/api/execute/route.ts` and `app/api/execute-chain/route.ts`
  - Preserve backward compatibility as wrappers that internally create/start a run and return legacy-shaped responses.

### 4.4 API key domain + middleware hardening
- Add `lib/security/api-keys.ts`
  - Key generation, hash (KDF), verify, revoke markers, rotation-ready metadata (`keyId`, `createdAt`, `lastUsedAt`, `revokedAt`).
- Refactor `middleware.ts`
  - Support either legacy env key or repository-backed key verification depending on mode.

### 4.5 CLI alignment hooks
- Ensure CLI calls run APIs using:
  - `NAVA_API_KEY` for auth.
  - Configurable endpoint base URL.
  - `create -> start -> poll/get` flow (with compatibility fallback to `/api/execute*`).

## 5) Migration and risk notes

### Backward compatibility
- Keep `/api/execute` and `/api/execute-chain` response shape stable in Phase 1.
- Introduce run APIs as additive surface first.
- Deprecate legacy endpoints later with explicit version notices.

### Schema evolution
- Version persisted run payloads (e.g., `schemaVersion`).
- Require additive-only changes within a major version.
- Maintain explicit migration helpers for stored snapshots/events.

### Security hardening
- Move from plaintext env-key equality to hashed key verification where available.
- Avoid returning key material after creation.
- Track revocation and usage metadata for incident response.
- Enforce mode-specific controls (stricter hosted defaults, safe self-hosted defaults).

## 6) Explicitly deferred items

The following are **intentionally deferred** beyond Phase 1:

1. Full planner execution engine.
2. Full verifier execution engine.
3. Full recovery execution engine.
4. CLI full rewrite (only alignment hooks + compatibility integration in Phase 1).
5. Confidence scoring pipeline beyond basic placeholder fields.

These items remain planned for Phase 2/3+ expansion once the lifecycle core is stable.
