import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface SwitchTabInput { index: number }

export const switchTabTool: SessionToolDefinition<SwitchTabInput> = {
  name: 'switch_tab',
  description: 'Switch to a browser tab by zero-based index.',
  inputSchema: { type: 'object', properties: { index: { type: 'number' } }, required: ['index'], additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Fails only if tab index becomes invalid.' },
  sideEffects: { hasSideEffects: true, category: 'navigation', description: 'Changes active browser tab context.' },
  handlerBoundary: { component: 'BrowserSession', method: 'switchToTab' },
  handler: async (session, input) => session.switchToTab(input.index),
};
