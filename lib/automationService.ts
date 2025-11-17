/**
 * Automation Service for Nava
 * Provides high-level browser automation functions using the MCP client
 */

import { MCPClient, createInstruction, createTask, MCPClientError } from './mcpClient';

export interface AutomationTask {
  url?: string;
  actions?: Array<{
    type: 'click' | 'type' | 'wait' | 'scroll' | 'screenshot' | 'getText' | 'hover' | 'select' | 'press';
    selector?: string;
    text?: string;
    value?: string;
    option?: string;
    key?: string;
    timeout?: number;
    direction?: 'up' | 'down' | 'top' | 'bottom';
    pixels?: number;
    fullPage?: boolean;
  }>;
  screenshot?: boolean;
  extractLinks?: boolean;
}

export interface AutomationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  pageUrl?: string;
  pageTitle?: string;
  logs?: Array<{
    type: string;
    text: string;
    timestamp: string;
  }>;
}

/**
 * Main automation service
 */
export class AutomationService {
  private mcpClient: MCPClient;

  constructor(mcpUrl?: string) {
    this.mcpClient = new MCPClient(mcpUrl, {
      timeout: 60000,
      maxRetries: 3,
    });
  }

  /**
   * Run a browser automation task
   */
  async runBrowserAutomation(task: AutomationTask): Promise<AutomationResult> {
    try {
      // Validate task
      if (!task.url && !task.actions?.length) {
        return {
          success: false,
          error: 'Task must include either a URL or actions',
        };
      }

      // Build instructions
      const instructions = [];

      // Navigate if URL provided
      if (task.url) {
        instructions.push(
          createInstruction('navigate', {
            url: task.url,
          })
        );
      }

      // Add actions
      if (task.actions) {
        for (const action of task.actions) {
          switch (action.type) {
            case 'click':
              instructions.push(
                createInstruction('click', {
                  selector: action.selector,
                  text: action.text,
                })
              );
              break;

            case 'type':
              instructions.push(
                createInstruction('type', {
                  selector: action.selector,
                  text: action.text || action.value || '',
                })
              );
              break;

            case 'wait':
              instructions.push(
                createInstruction('wait', {
                  selector: action.selector,
                  timeout: action.timeout,
                })
              );
              break;

            case 'scroll':
              instructions.push(
                createInstruction('scroll', {
                  direction: action.direction || 'down',
                  pixels: action.pixels,
                })
              );
              break;

            case 'hover':
              instructions.push(
                createInstruction('hover', {
                  selector: action.selector,
                })
              );
              break;

            case 'select':
              instructions.push(
                createInstruction('select', {
                  selector: action.selector,
                  option: action.option,
                })
              );
              break;

            case 'press':
              instructions.push(
                createInstruction('press', {
                  key: action.key,
                })
              );
              break;

            case 'getText':
              instructions.push(
                createInstruction('getText', {
                  selector: action.selector,
                })
              );
              break;

            case 'screenshot':
              instructions.push(
                createInstruction('screenshot', {
                  fullPage: action.fullPage || false,
                })
              );
              break;
          }
        }
      }

      // Add screenshot if requested
      if (task.screenshot) {
        instructions.push(
          createInstruction('screenshot', {
            fullPage: true,
          })
        );
      }

      // Add extract links if requested
      if (task.extractLinks) {
        instructions.push(createInstruction('extractLinks', {}));
      }

      // Execute task
      const mcpTask = createTask(instructions);
      const response = await this.mcpClient.run(mcpTask);

      if (response.success && response.result) {
        return {
          success: true,
          data: response.result,
          pageUrl: response.result.pageUrl,
          pageTitle: response.result.pageTitle,
          logs: response.logs,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Unknown error occurred',
        };
      }
    } catch (error) {
      console.error('Automation error:', error);

      if (error instanceof MCPClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if MCP server is healthy
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const health = await this.mcpClient.healthCheck();
      return {
        healthy: health.status === 'ok',
        status: health.status,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Create a singleton instance
 */
let automationServiceInstance: AutomationService | null = null;

export function getAutomationService(): AutomationService {
  if (!automationServiceInstance) {
    automationServiceInstance = new AutomationService();
  }
  return automationServiceInstance;
}

/**
 * Convenience function to run browser automation
 */
export async function runBrowserAutomation(
  task: AutomationTask
): Promise<AutomationResult> {
  const service = getAutomationService();
  return service.runBrowserAutomation(task);
}

/**
 * Convenience function to check MCP server health
 */
export async function checkMCPHealth(): Promise<{
  healthy: boolean;
  status?: string;
  error?: string;
}> {
  const service = getAutomationService();
  return service.checkHealth();
}
