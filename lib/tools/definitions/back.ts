import { SessionToolDefinition, taskResultSchema } from '../tool-types';

export const backTool: SessionToolDefinition<Record<string, never>> = {
  name: 'back',
  description: 'Navigate to the previous page in browser history.',
  inputSchema: { type: 'object', additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: false, strategy: 'never', reason: 'Repeated calls can move too far back in history.' },
  sideEffects: { hasSideEffects: true, category: 'navigation', description: 'Mutates browser history position.' },
  handlerBoundary: { component: 'BrowserSession', method: 'back' },
  handler: async (session) => session.back(),
};
