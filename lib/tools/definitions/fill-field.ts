import { SessionToolDefinition, taskResultSchema } from '../tool-types';

interface FillFieldInput { target: string; value: string; mode?: 'selector' | 'label' }

export const fillFieldTool: SessionToolDefinition<FillFieldInput> = {
  name: 'fill_field',
  description: 'Fill a form field by selector or human-readable label.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string' },
      value: { type: 'string' },
      mode: { type: 'string', enum: ['selector', 'label'] },
    },
    required: ['target', 'value'],
    additionalProperties: false,
  },
  outputSchema: taskResultSchema,
  retryability: { retryable: true, strategy: 'conditional', reason: 'Fields may render after async operations.' },
  sideEffects: { hasSideEffects: true, category: 'state', description: 'Mutates form state.' },
  handlerBoundary: { component: 'BrowserSession', method: 'fill | fillByLabel', notes: 'Selects method by mode.' },
  handler: async (session, input) => input.mode === 'selector' ? session.fill(input.target, input.value) : session.fillByLabel(input.target, input.value),
};
