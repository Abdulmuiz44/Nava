import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface ExtractTextInput { selector: string }

export const extractTextTool: SessionToolDefinition<ExtractTextInput> = {
  name: 'extract_text',
  description: 'Extract text content from an element selector.',
  inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'], additionalProperties: false },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'safe-idempotent', reason: 'Read operation can be retried safely.' },
  sideEffects: { hasSideEffects: false, category: 'none', description: 'Reads page content without mutating state.' },
  handlerBoundary: { component: 'BrowserSession', method: 'getText' },
  handler: async (session, input) => session.getText(input.selector),
};
