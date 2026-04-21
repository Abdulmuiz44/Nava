import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface SelectOptionInput { selector: string; option: string }

export const selectOptionTool: SessionToolDefinition<SelectOptionInput> = {
  name: 'select_option',
  description: 'Select an option in a dropdown element.',
  inputSchema: {
    type: 'object',
    properties: { selector: { type: 'string' }, option: { type: 'string' } },
    required: ['selector', 'option'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Select elements may not be immediately available.' },
  sideEffects: { hasSideEffects: true, category: 'state', description: 'Changes form control selection.' },
  handlerBoundary: { component: 'BrowserSession', method: 'selectOption' },
  handler: async (session, input) => session.selectOption(input.selector, input.option),
};
