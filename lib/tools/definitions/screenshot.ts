import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface ScreenshotInput { path?: string }

export const screenshotTool: SessionToolDefinition<ScreenshotInput> = {
  name: 'screenshot',
  description: 'Capture a PNG screenshot of the current page.',
  inputSchema: {
    type: 'object',
    properties: { path: { type: 'string', description: 'Optional filesystem output path.' } },
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'safe-idempotent', reason: 'Capturing screenshots is safe to repeat.' },
  sideEffects: { hasSideEffects: false, category: 'none', description: 'Read-only page capture.' },
  handlerBoundary: { component: 'BrowserSession', method: 'screenshot' },
  handler: async (session, input) => {
    const buffer = await session.screenshot(input.path);
    return {
      success: true,
      taskType: 'screenshot',
      detail: 'Screenshot captured',
      data: { screenshot: buffer.toString('base64') },
    };
  },
};
