import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface NavigateInput { url: string }

export const navigateTool: SessionToolDefinition<NavigateInput> = {
  name: 'navigate',
  description: 'Navigate the active browser tab to a URL.',
  inputSchema: {
    type: 'object',
    properties: { url: { type: 'string', description: 'Destination URL.' } },
    required: ['url'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Retries are safe for transient navigation failures.' },
  sideEffects: { hasSideEffects: true, category: 'navigation', description: 'Changes current page.' },
  handlerBoundary: { component: 'BrowserSession', method: 'goto' },
  handler: async (session, input) => session.goto(input.url),
};
