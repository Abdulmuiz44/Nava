/**
 * MCP Client for Nava
 * Handles communication with the Playwright MCP Server on Fly.io
 */

interface MCPInstruction {
  type: string;
  params: Record<string, any>;
}

interface MCPTask {
  instructions: MCPInstruction[];
}

interface MCPResponse {
  success: boolean;
  result?: {
    totalInstructions: number;
    results: Array<{
      instruction: string;
      success: boolean;
      data?: any;
      error?: string;
    }>;
    pageUrl: string;
    pageTitle: string;
  };
  logs?: Array<{
    type: string;
    text: string;
    timestamp: string;
  }>;
  error?: string;
}

export class MCPClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(
    baseUrl?: string,
    options: { timeout?: number; maxRetries?: number } = {}
  ) {
    this.baseUrl = baseUrl || process.env.MCP_PLAYWRIGHT_URL || '';
    this.timeout = options.timeout || 60000; // 60 seconds default
    this.maxRetries = options.maxRetries || 3;

    if (!this.baseUrl) {
      throw new Error(
        'MCP_PLAYWRIGHT_URL environment variable is not set. Please configure your Fly.io deployment URL.'
      );
    }

    // Ensure baseUrl doesn't end with slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  /**
   * Execute a task on the remote Playwright MCP Server
   */
  async run(task: MCPTask): Promise<MCPResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.executeRequest(task);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `MCP request attempt ${attempt}/${this.maxRetries} failed:`,
          error instanceof Error ? error.message : 'Unknown error'
        );

        // Don't retry on 4xx errors (client errors)
        if (error instanceof MCPClientError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.sleep(delay);
        }
      }
    }

    throw new MCPClientError(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      503
    );
  }

  /**
   * Check health of the MCP server
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    activeBrowsers: number;
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new MCPClientError(
          `Health check failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof MCPClientError) {
        throw error;
      }
      throw new MCPClientError(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        503
      );
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest(task: MCPTask): Promise<MCPResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      let data: MCPResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new MCPClientError(
          `Invalid JSON response from MCP server`,
          response.status
        );
      }

      if (!response.ok) {
        throw new MCPClientError(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof MCPClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new MCPClientError(
            `Request timeout after ${this.timeout}ms`,
            408
          );
        }
        throw new MCPClientError(
          `Network error: ${error.message}`,
          503
        );
      }

      throw new MCPClientError('Unknown error occurred', 500);
    }
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Custom error class for MCP client errors
 */
export class MCPClientError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'MCPClientError';
  }
}

/**
 * Helper function to create MCP instructions
 */
export const createInstruction = (
  type: string,
  params: Record<string, any>
): MCPInstruction => ({
  type,
  params,
});

/**
 * Helper function to create a task
 */
export const createTask = (
  instructions: MCPInstruction[]
): MCPTask => ({
  instructions,
});
