import { BrowserSession, TaskResult } from '@/lib/browser';
import { executeTask, executeTaskChain } from '@/lib/task-executor';
import { createPersistenceAdapter } from '@/lib/persistence';
import { AgentRunLifecycleService } from './service';
import { buildRunSnapshot } from './snapshot-builder';

const persistence = createPersistenceAdapter({
  mode: (process.env.NAVA_RUN_MODE as 'self-hosted' | 'hosted' | undefined) ?? 'self-hosted',
});

const runService = new AgentRunLifecycleService(persistence);

export function getRunService(): AgentRunLifecycleService {
  return runService;
}

export interface ExecuteRunResult {
  success: boolean;
  result?: TaskResult;
  results?: TaskResult[];
  error?: string;
}

export async function executeRunById(runId: string): Promise<ExecuteRunResult> {
  const service = getRunService();
  const run = await service.getRun(runId);

  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  const tasks = run.context.tasks ?? (run.context.task ? [run.context.task] : []);
  if (tasks.length === 0) {
    throw new Error(`Run ${runId} has no executable task(s).`);
  }

  let session: BrowserSession | null = null;

  try {
    await service.startRun(runId, 'execution');

    session = new BrowserSession({ headless: run.context.headless ?? true });
    await session.initialize();

    const lifecycle = {
      runId,
      onTaskStart: async (task: string) => {
        await service.appendEvent(runId, {
          type: 'task_started',
          phase: 'execution',
          payload: { task },
        });
      },
      onTaskComplete: async (task: string, result: TaskResult) => {
        await service.appendEvent(runId, {
          type: 'task_completed',
          phase: 'execution',
          payload: {
            task,
            success: result.success,
            taskType: result.taskType,
            detail: result.detail,
          },
        });
      },
      onTaskError: async (task: string, error: unknown) => {
        await service.appendEvent(runId, {
          type: 'task_error',
          phase: 'execution',
          payload: {
            task,
            error: error instanceof Error ? error.message : 'Unknown task error',
          },
        });
      },
    };

    if (tasks.length === 1) {
      const result = await executeTask(tasks[0], session, lifecycle);
      const snapshot = await buildRunSnapshot(runId, session);
      await service.appendSnapshot(runId, snapshot);

      if (result.success) {
        await service.completeRun(runId);
      } else {
        await service.failRun(runId, result.errorMessage ?? 'Task execution failed');
      }

      return { success: result.success, result };
    }

    const results = await executeTaskChain(tasks, session, lifecycle);
    const snapshot = await buildRunSnapshot(runId, session);
    await service.appendSnapshot(runId, snapshot);

    const success = results.every((entry) => entry.success);
    if (success) {
      await service.completeRun(runId);
    } else {
      const firstError = results.find((entry) => !entry.success)?.errorMessage ?? 'Task chain failed';
      await service.failRun(runId, firstError);
    }

    return { success, results };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Run execution failed';
    try {
      await service.failRun(runId, message);
    } catch {
      // Ignore transition errors from already terminal runs.
    }

    if (tasks.length === 1) {
      return {
        success: false,
        result: {
          success: false,
          taskType: 'unknown',
          detail: 'Run execution failed',
          errorMessage: message,
        },
        error: message,
      };
    }

    return {
      success: false,
      results: [
        {
          success: false,
          taskType: 'unknown',
          detail: 'Run execution failed',
          errorMessage: message,
        },
      ],
      error: message,
    };
  } finally {
    if (session) {
      try {
        await session.close();
      } catch {
        // Best-effort browser cleanup.
      }
    }
  }
}
