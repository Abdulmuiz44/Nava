import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface PressKeyInput { key: string }

export const pressKeyTool: SessionToolDefinition<PressKeyInput> = {
  name: 'press_key',
  description: 'Send a keyboard key press to the active page.',
  inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'], additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Focus issues can cause intermittent failures.' },
  sideEffects: { hasSideEffects: true, category: 'interaction', description: 'Triggers key-driven UI actions.' },
  handlerBoundary: { component: 'BrowserSession', method: 'press' },
  handler: async (session, input) => session.press(input.key),
};
