import { BrowserSession, TaskResult } from '@/lib/browser';

export type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export interface ToolSchema {
  type: SchemaType;
  description?: string;
  properties?: Record<string, ToolSchema>;
  required?: string[];
  items?: ToolSchema;
  additionalProperties?: boolean;
  enum?: Array<string | number | boolean>;
}

export interface RetryabilityMetadata {
  retryable: boolean;
  strategy: 'never' | 'safe-idempotent' | 'conditional';
  reason: string;
}

export interface SideEffectMetadata {
  hasSideEffects: boolean;
  category: 'none' | 'navigation' | 'interaction' | 'state';
  description: string;
}

export interface HandlerBoundary {
  component: 'BrowserSession';
  method: string;
  notes?: string;
}

export interface ToolDefinition<I, O> {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  outputSchema: ToolSchema;
  retryability: RetryabilityMetadata;
  sideEffects: SideEffectMetadata;
  handlerBoundary: HandlerBoundary;
  handler: (session: BrowserSession, input: I) => Promise<O>;
}

export type SessionToolDefinition<I = any, O = TaskResult> = ToolDefinition<I, O>;

export const taskResultSchema: ToolSchema = {
  type: 'object',
  description: 'Standard task result response',
  properties: {
    success: { type: 'boolean' },
    taskType: { type: 'string' },
    detail: { type: 'string' },
    data: { type: 'object', additionalProperties: true },
    errorMessage: { type: 'string' },
  },
  required: ['success', 'taskType', 'detail'],
  additionalProperties: true,
};
