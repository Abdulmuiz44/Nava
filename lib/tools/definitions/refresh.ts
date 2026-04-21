import { SessionToolDefinition, taskResultSchema } from '../tool-types';

export const refreshTool: SessionToolDefinition<Record<string, never>> = {
  name: 'refresh',
  description: 'Reload the current browser page.',
  inputSchema: { type: 'object', additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Safe when page actions are idempotent.' },
  sideEffects: { hasSideEffects: true, category: 'navigation', description: 'Reloads and resets dynamic UI state.' },
  handlerBoundary: { component: 'BrowserSession', method: 'refresh' },
  handler: async (session) => session.refresh(),
};
