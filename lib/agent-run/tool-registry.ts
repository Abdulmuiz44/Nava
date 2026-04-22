export interface ToolExecutionInput {
  runId: string;
  args: Record<string, unknown>;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AgentTool {
  name: string;
  description?: string;
  execute(input: ToolExecutionInput): Promise<ToolExecutionResult>;
}

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | null {
    return this.tools.get(name) ?? null;
  }

  list(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  async invoke(name: string, input: ToolExecutionInput): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        error: `Unknown tool: ${name}`,
      };
    }

    try {
      return await tool.execute(input);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool invocation failed',
      };
    }
  }
}
