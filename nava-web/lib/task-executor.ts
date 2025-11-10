import { BrowserSession, TaskResult } from './browser';

export class TaskExecutor {
  private session: BrowserSession;

  constructor(session: BrowserSession) {
    this.session = session;
  }

  async executeTask(task: string): Promise<TaskResult> {
    const normalizedTask = task.toLowerCase().trim();

    // Navigate tasks
    if (normalizedTask.startsWith('go to ') || normalizedTask.startsWith('navigate to ') || normalizedTask.startsWith('visit ')) {
      const url = this.extractUrl(task);
      return await this.session.goto(url);
    }

    // Search tasks
    if (normalizedTask.startsWith('search for ') || normalizedTask.startsWith('search ')) {
      const query = task.replace(/^search\s+(for\s+)?/i, '').trim();
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      return await this.session.goto(searchUrl);
    }

    // Click tasks
    if (normalizedTask.startsWith('click ')) {
      const selector = this.extractSelector(task, 'click');
      return await this.session.click(selector);
    }

    // Fill tasks
    const fillMatch = task.match(/fill\s+(.+?)\s+with\s+(.+)/i);
    if (fillMatch) {
      const selector = fillMatch[1].trim();
      const text = fillMatch[2].trim();
      return await this.session.fill(selector, text);
    }

    // Type tasks
    const typeMatch = task.match(/type\s+(.+?)\s+(?:in|into)\s+(.+)/i);
    if (typeMatch) {
      const text = typeMatch[1].trim();
      const selector = typeMatch[2].trim();
      return await this.session.type(selector, text);
    }

    // Press key tasks
    if (normalizedTask.startsWith('press ')) {
      const key = task.replace(/^press\s+/i, '').trim();
      return await this.session.press(key);
    }

    // Extract tasks
    if (normalizedTask.includes('extract ')) {
      if (normalizedTask.includes('links')) {
        const links = await this.session.extractLinks();
        return {
          success: true,
          taskType: 'extract',
          detail: `Extracted ${links.length} links`,
          data: { links },
        };
      }
    }

    // Screenshot tasks
    if (normalizedTask.includes('screenshot') || normalizedTask.includes('capture')) {
      const screenshot = await this.session.screenshot();
      return {
        success: true,
        taskType: 'screenshot',
        detail: 'Screenshot captured',
        data: { screenshot: screenshot.toString('base64') },
      };
    }

    // Wait tasks
    const waitMatch = task.match(/wait\s+(?:for\s+)?(\d+)\s*(?:seconds?|ms)?/i);
    if (waitMatch) {
      const duration = parseInt(waitMatch[1]);
      await new Promise(resolve => setTimeout(resolve, duration * 1000));
      return {
        success: true,
        taskType: 'wait',
        detail: `Waited for ${duration} seconds`,
      };
    }

    return {
      success: false,
      taskType: 'unknown',
      detail: 'Task not recognized',
      errorMessage: `Unable to parse task: ${task}`,
    };
  }

  async executeChain(tasks: string[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    
    for (const task of tasks) {
      const result = await this.executeTask(task);
      results.push(result);
      
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  private extractUrl(task: string): string {
    const urlMatch = task.match(/(?:go to|navigate to|visit)\s+(.+)/i);
    if (urlMatch) {
      let url = urlMatch[1].trim();
      // Remove quotes if present
      url = url.replace(/^["']|["']$/g, '');
      return url;
    }
    return '';
  }

  private extractSelector(task: string, command: string): string {
    const regex = new RegExp(`${command}\\s+(.+)`, 'i');
    const match = task.match(regex);
    if (match) {
      let selector = match[1].trim();
      // Remove quotes if present
      selector = selector.replace(/^["']|["']$/g, '');
      return selector;
    }
    return '';
  }
}

export async function executeTask(task: string, session: BrowserSession): Promise<TaskResult> {
  const executor = new TaskExecutor(session);
  return await executor.executeTask(task);
}

export async function executeTaskChain(tasks: string[], session: BrowserSession): Promise<TaskResult[]> {
  const executor = new TaskExecutor(session);
  return await executor.executeChain(tasks);
}
