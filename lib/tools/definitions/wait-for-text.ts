import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface WaitForTextInput { text: string; timeoutMs?: number }

export const waitForTextTool: SessionToolDefinition<WaitForTextInput> = {
  name: 'wait_for_text',
  description: 'Wait for visible text to appear on the page.',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string' }, timeoutMs: { type: 'number' } },
    required: ['text'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'safe-idempotent', reason: 'Pure wait operation is safe to retry.' },
  sideEffects: { hasSideEffects: false, category: 'none', description: 'Read-only wait for condition.' },
  handlerBoundary: { component: 'BrowserSession', method: 'waitForText' },
  handler: async (session, input) => session.waitForText(input.text, input.timeoutMs),
};
