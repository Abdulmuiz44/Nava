import { chromium, Browser, BrowserContext, Page, LaunchOptions } from 'playwright';

export interface BrowserConfig {
  headless?: boolean;
  navigationTimeout?: number;
  elementTimeout?: number;
  browserType?: 'chromium' | 'firefox' | 'webkit';
}

export interface TaskResult {
  success: boolean;
  taskType: string;
  detail: string;
  data?: any;
  errorMessage?: string;
}

export class BrowserSession {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;

  constructor(config: BrowserConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      navigationTimeout: config.navigationTimeout ?? 30000,
      elementTimeout: config.elementTimeout ?? 10000,
      browserType: config.browserType ?? 'chromium',
    };
  }

  async initialize(): Promise<void> {
    const launchOptions: LaunchOptions = {
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    };

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    this.page = await this.context.newPage();
    this.page.setDefaultNavigationTimeout(this.config.navigationTimeout!);
    this.page.setDefaultTimeout(this.config.elementTimeout!);
  }

  async goto(url: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: this.config.navigationTimeout 
      });

      return {
        success: true,
        taskType: 'navigation',
        detail: `Navigated to ${url}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'navigation',
        detail: `Failed to navigate to ${url}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async click(selector: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { 
        timeout: this.config.elementTimeout 
      });
      await this.page.click(selector);

      return {
        success: true,
        taskType: 'click',
        detail: `Clicked element: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'click',
        detail: `Failed to click element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async fill(selector: string, text: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { 
        timeout: this.config.elementTimeout 
      });
      await this.page.fill(selector, text);

      return {
        success: true,
        taskType: 'fill',
        detail: `Filled element ${selector} with text`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'fill',
        detail: `Failed to fill element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async type(selector: string, text: string, delay?: number): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { 
        timeout: this.config.elementTimeout 
      });
      await this.page.type(selector, text, { delay: delay ?? 50 });

      return {
        success: true,
        taskType: 'type',
        detail: `Typed text into element: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'type',
        detail: `Failed to type into element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async press(key: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.keyboard.press(key);

      return {
        success: true,
        taskType: 'press',
        detail: `Pressed key: ${key}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'press',
        detail: `Failed to press key: ${key}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async screenshot(path?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    const screenshot = await this.page.screenshot({ 
      type: 'png',
      path,
      fullPage: true,
    });

    return screenshot;
  }

  async extractText(selector: string): Promise<string | null> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { 
        timeout: this.config.elementTimeout 
      });
      return await this.page.textContent(selector);
    } catch (error) {
      return null;
    }
  }

  async extractLinks(): Promise<string[]> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    return await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => link.href).filter(href => href);
    });
  }

  async clickByText(text: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      // Try multiple strategies to find and click the element
      const selectors = [
        `text="${text}"`,
        `button:has-text("${text}")`,
        `a:has-text("${text}")`,
        `[role="button"]:has-text("${text}")`,
        `*:has-text("${text}")`,
      ];

      let clicked = false;
      let usedSelector = '';

      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector, { timeout: 5000 });
          clicked = true;
          usedSelector = selector;
          break;
        } catch (e) {
          // Try next selector
          continue;
        }
      }

      if (!clicked) {
        throw new Error(`Could not find clickable element with text: ${text}`);
      }

      return {
        success: true,
        taskType: 'click',
        detail: `Clicked element with text: "${text}"`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'click',
        detail: `Failed to click element with text: "${text}"`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async fillByLabel(labelText: string, value: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      // Try to find input by associated label
      const input = await this.page.evaluateHandle((label) => {
        // Find label containing the text
        const labels = Array.from(document.querySelectorAll('label'));
        const matchingLabel = labels.find(l => 
          l.textContent?.toLowerCase().includes(label.toLowerCase())
        );

        if (matchingLabel) {
          // Get associated input
          if (matchingLabel.htmlFor) {
            return document.getElementById(matchingLabel.htmlFor);
          }
          return matchingLabel.querySelector('input, textarea, select');
        }

        // Try finding input by placeholder or name
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        return inputs.find(input => {
          const placeholder = input.getAttribute('placeholder')?.toLowerCase() || '';
          const name = input.getAttribute('name')?.toLowerCase() || '';
          const id = input.getAttribute('id')?.toLowerCase() || '';
          const searchTerm = label.toLowerCase();
          return placeholder.includes(searchTerm) || 
                 name.includes(searchTerm) || 
                 id.includes(searchTerm);
        });
      }, labelText);

      const element = input.asElement();
      if (element) {
        await element.fill(value);
        return {
          success: true,
          taskType: 'fill',
          detail: `Filled "${labelText}" with value`,
        };
      } else {
        throw new Error(`Could not find input for: ${labelText}`);
      }
    } catch (error) {
      return {
        success: false,
        taskType: 'fill',
        detail: `Failed to fill "${labelText}"`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async fillMultipleFields(fields: { label: string; value: string }[]): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    const results: string[] = [];
    let allSuccess = true;

    for (const field of fields) {
      const result = await this.fillByLabel(field.label, field.value);
      results.push(result.detail);
      if (!result.success) {
        allSuccess = false;
        break;
      }
    }

    return {
      success: allSuccess,
      taskType: 'fill',
      detail: results.join(', '),
    };
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getPage(): Page | null {
    return this.page;
  }
}
