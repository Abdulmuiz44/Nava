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

    // Click tasks with smart text-based selection
    if (normalizedTask.startsWith('click ')) {
      const target = task.replace(/^click\s+/i, '').trim();
      
      // Check if it looks like a CSS selector (starts with . # [ or contains specific chars)
      if (target.match(/^[.#\[]/) || target.includes('::')) {
        return await this.session.click(target);
      }
      
      // Otherwise, treat as text to click
      return await this.session.clickByText(target);
    }

    // Fill tasks - handle both single and multiple fields
    if (normalizedTask.includes('fill ')) {
      // Pattern: "fill email and password"
      const multiFieldMatch = task.match(/fill\s+(.+?)\s+(?:and|with values?)/i);
      if (multiFieldMatch) {
        const fieldNames = multiFieldMatch[1].split(/\s+and\s+/i);
        // This is for declaring intent, actual values come from user interaction
        return {
          success: true,
          taskType: 'fill',
          detail: `Ready to fill: ${fieldNames.join(', ')}`,
          data: { fields: fieldNames }
        };
      }

      // Pattern: "fill [field] with [value]"
      const fillMatch = task.match(/fill\s+(.+?)\s+with\s+(.+)/i);
      if (fillMatch) {
        const fieldLabel = fillMatch[1].trim();
        const value = fillMatch[2].trim();
        
        // Check if it looks like a CSS selector
        if (fieldLabel.match(/^[.#\[]/) || fieldLabel.includes('::')) {
          return await this.session.fill(fieldLabel, value);
        }
        
        // Otherwise, treat as label text
        return await this.session.fillByLabel(fieldLabel, value);
      }
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

    // Access/Dashboard navigation
    if (normalizedTask.includes('access ') || normalizedTask.includes('open ') || normalizedTask.includes('navigate to ')) {
      const pageMatch = task.match(/(?:access|open|navigate to)\s+(?:my\s+)?(.+)/i);
      if (pageMatch) {
        const pageName = pageMatch[1].trim();
        // Try to find and click a link/button with that text
        return await this.session.clickByText(pageName);
      }
    }

    // Submit/Login actions
    if (normalizedTask.includes('submit') || normalizedTask.includes('login') || normalizedTask.includes('sign in')) {
      // Try to find and click submit button
      const submitTexts = ['submit', 'login', 'sign in', 'log in', 'enter', 'go'];
      for (const text of submitTexts) {
        const result = await this.session.clickByText(text);
        if (result.success) {
          return result;
        }
      }
      // Also try pressing Enter
      return await this.session.press('Enter');
    }

    // Scroll tasks
    if (normalizedTask.includes('scroll')) {
      if (normalizedTask.includes('to top') || normalizedTask === 'scroll top') {
        return await this.session.scroll('top');
      }
      if (normalizedTask.includes('to bottom') || normalizedTask === 'scroll bottom') {
        return await this.session.scroll('bottom');
      }
      if (normalizedTask.includes('down')) {
        const distanceMatch = task.match(/scroll down\s+(\d+)/i);
        const distance = distanceMatch ? parseInt(distanceMatch[1]) : undefined;
        return await this.session.scroll('down', distance);
      }
      if (normalizedTask.includes('up')) {
        const distanceMatch = task.match(/scroll up\s+(\d+)/i);
        const distance = distanceMatch ? parseInt(distanceMatch[1]) : undefined;
        return await this.session.scroll('up', distance);
      }
      // Scroll to element
      const scrollToMatch = task.match(/scroll to\s+(.+)/i);
      if (scrollToMatch) {
        const selector = scrollToMatch[1].trim();
        return await this.session.scrollToElement(selector);
      }
    }

    // Hover tasks
    if (normalizedTask.startsWith('hover')) {
      const hoverMatch = task.match(/hover\s+(?:over\s+)?(.+)/i);
      if (hoverMatch) {
        const selector = hoverMatch[1].trim();
        return await this.session.hover(selector);
      }
    }

    // Select dropdown tasks
    if (normalizedTask.includes('select')) {
      const selectMatch = task.match(/select\s+["']?(.+?)["']?\s+from\s+(.+)/i);
      if (selectMatch) {
        const option = selectMatch[1].trim();
        const selector = selectMatch[2].trim();
        return await this.session.selectOption(selector, option);
      }
    }

    // Get text tasks
    if (normalizedTask.startsWith('get text') || normalizedTask.startsWith('extract text')) {
      const textMatch = task.match(/(?:get|extract)\s+text\s+(?:from\s+)?(.+)/i);
      if (textMatch) {
        const selector = textMatch[1].trim();
        return await this.session.getText(selector);
      }
    }

    // Wait for element tasks
    if (normalizedTask.includes('wait for')) {
      const waitForMatch = task.match(/wait for\s+(.+?)(?:\s+to\s+(?:appear|be visible))?(?:\s+for\s+(\d+)\s*(?:seconds|ms))?$/i);
      if (waitForMatch) {
        const selector = waitForMatch[1].trim();
        const timeout = waitForMatch[2] ? parseInt(waitForMatch[2]) * 1000 : undefined;
        return await this.session.waitForElement(selector, timeout);
      }
    }

    // Switch tab tasks
    if (normalizedTask.includes('switch to tab')) {
      const tabMatch = task.match(/switch to tab\s+(\d+)/i);
      if (tabMatch) {
        const tabIndex = parseInt(tabMatch[1]);
        return await this.session.switchToTab(tabIndex);
      }
    }

    // Upload file tasks
    if (normalizedTask.includes('upload')) {
      const uploadMatch = task.match(/upload\s+(.+?)\s+to\s+(.+)/i);
      if (uploadMatch) {
        const filePath = uploadMatch[1].trim();
        const selector = uploadMatch[2].trim();
        return await this.session.uploadFile(selector, filePath);
      }
    }

    // Download tasks
    if (normalizedTask.includes('download')) {
      return await this.session.getDownloadUrl();
    }

    return {
      success: false,
      taskType: 'unknown',
      detail: 'Task not recognized',
      errorMessage: `Unable to parse task: ${task}`,
    };
  }

  // Helper method to parse and execute form filling with multiple fields
  async fillFormFields(fieldValuePairs: string): Promise<TaskResult> {
    // Parse patterns like "email: test@test.com, password: 123456"
    const pairs = fieldValuePairs.split(',').map(pair => {
      const [label, value] = pair.split(':').map(s => s.trim());
      return { label, value };
    }).filter(p => p.label && p.value);

    if (pairs.length === 0) {
      return {
        success: false,
        taskType: 'fill',
        detail: 'Could not parse field-value pairs',
      };
    }

    return await this.session.fillMultipleFields(pairs);
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
