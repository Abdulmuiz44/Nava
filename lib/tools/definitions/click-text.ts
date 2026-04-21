import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface ClickTextInput { text: string }

export const clickTextTool: SessionToolDefinition<ClickTextInput> = {
  name: 'click_text',
  description: 'Click an element by visible text.',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string' } },
    required: ['text'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'UI timing can make element temporarily unavailable.' },
  sideEffects: { hasSideEffects: true, category: 'interaction', description: 'Triggers UI click action.' },
  handlerBoundary: { component: 'BrowserSession', method: 'clickByText' },
  handler: async (session, input) => session.clickByText(input.text),
};
