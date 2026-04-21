import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface WaitForElementInput { selector: string; timeoutMs?: number }

export const waitForElementTool: SessionToolDefinition<WaitForElementInput> = {
  name: 'wait_for_element',
  description: 'Wait for an element to become visible.',
  inputSchema: {
    type: 'object',
    properties: { selector: { type: 'string' }, timeoutMs: { type: 'number' } },
    required: ['selector'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'safe-idempotent', reason: 'Pure wait operation is safe to retry.' },
  sideEffects: { hasSideEffects: false, category: 'none', description: 'Read-only wait for selector visibility.' },
  handlerBoundary: { component: 'BrowserSession', method: 'waitForElement' },
  handler: async (session, input) => session.waitForElement(input.selector, input.timeoutMs),
};
