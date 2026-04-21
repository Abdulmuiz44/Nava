import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface HoverInput { selector: string }

export const hoverTool: SessionToolDefinition<HoverInput> = {
  name: 'hover',
  description: 'Hover over an element matching a selector.',
  inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'], additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Target visibility can be transient.' },
  sideEffects: { hasSideEffects: true, category: 'interaction', description: 'Activates hover interactions.' },
  handlerBoundary: { component: 'BrowserSession', method: 'hover' },
  handler: async (session, input) => session.hover(input.selector),
};
