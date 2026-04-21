import { BrowserSession, TaskResult } from '@/lib/browser';
import { SessionToolDefinition } from './tool-types';
import { defaultTools } from './definitions';

export class ToolRegistry {
  private readonly tools = new Map<string, SessionToolDefinition<unknown, TaskResult>>();

  register<I, O extends TaskResult>(definition: SessionToolDefinition<I, O>): void {
    this.tools.set(definition.name, definition as SessionToolDefinition<unknown, TaskResult>);
  }

  registerMany(definitions: SessionToolDefinition[]): void {
    definitions.forEach((definition) => this.register(definition));
  }

  get(name: string): SessionToolDefinition<unknown, TaskResult> | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): SessionToolDefinition<unknown, TaskResult>[] {
    return Array.from(this.tools.values());
  }

  async execute(name: string, session: BrowserSession, input: unknown): Promise<TaskResult> {
    const definition = this.get(name);

    if (!definition) {
      return {
        success: false,
        taskType: 'unknown',
        detail: `Tool not found: ${name}`,
      };
    }

    return definition.handler(session, input);
  }
}

export const toolRegistry = new ToolRegistry();
toolRegistry.registerMany(defaultTools);

export async function executeRegisteredTool(name: string, session: BrowserSession, input: unknown): Promise<TaskResult> {
  return toolRegistry.execute(name, session, input);
}
