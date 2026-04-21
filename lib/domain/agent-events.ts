export type AgentEventName =
  | 'run_created'
  | 'planning_started'
  | 'planning_completed'
  | 'execution_started'
  | 'action_selected'
  | 'action_executed'
  | 'snapshot_recorded'
  | 'run_succeeded'
  | 'run_failed'
  | 'run_cancelled';

export interface AgentEventPayloads {
  run_created: {
    status: string;
  };
  planning_started: {
    message?: string;
  };
  planning_completed: {
    planStepCount?: number;
  };
  execution_started: {
    actionCount?: number;
  };
  action_selected: {
    actionName: string;
    rationale?: string;
  };
  action_executed: {
    actionName: string;
    success: boolean;
    details?: string;
  };
  snapshot_recorded: {
    snapshotId?: string;
    label?: string;
  };
  run_succeeded: {
    summary?: string;
  };
  run_failed: {
    error: string;
  };
  run_cancelled: {
    reason?: string;
  };
}

export type AgentEvent<TName extends AgentEventName = AgentEventName> = {
  id: string;
  runId: string;
  name: TName;
  timestamp: string;
  payload: AgentEventPayloads[TName];
};

export type AgentRunEvent = {
  [TName in AgentEventName]: AgentEvent<TName>;
}[AgentEventName];
