import { SessionToolDefinition, taskResultSchema } from '../tool-types';

type ScrollDirection = 'up' | 'down' | 'top' | 'bottom';
interface ScrollInput { direction: ScrollDirection; distance?: number }

export const scrollTool: SessionToolDefinition<ScrollInput> = {
  name: 'scroll',
  description: 'Scroll the page in a direction by an optional distance.',
  inputSchema: {
    type: 'object',
    properties: {
      direction: { type: 'string', enum: ['up', 'down', 'top', 'bottom'] },
      distance: { type: 'number' },
    },
    required: ['direction'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: false, strategy: 'never', reason: 'Repeated scrolling can alter context unpredictably.' },
  sideEffects: { hasSideEffects: true, category: 'interaction', description: 'Changes viewport position.' },
  handlerBoundary: { component: 'BrowserSession', method: 'scroll' },
  handler: async (session, input) => session.scroll(input.direction, input.distance),
};
