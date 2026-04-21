import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface ClickSelectorInput { selector: string }

export const clickSelectorTool: SessionToolDefinition<ClickSelectorInput> = {
  name: 'click_selector',
  description: 'Click an element using a CSS selector.',
  inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'], additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Element readiness can be transient.' },
  sideEffects: { hasSideEffects: true, category: 'interaction', description: 'Triggers UI click action.' },
  handlerBoundary: { component: 'BrowserSession', method: 'click' },
  handler: async (session, input) => session.click(input.selector),
};
