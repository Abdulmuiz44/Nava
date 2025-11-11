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
  data?: unknown;
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
    } catch {
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

      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector, { timeout: 5000 });
          clicked = true;
          break;
        } catch {
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

  async scroll(direction: 'up' | 'down' | 'top' | 'bottom', distance?: number): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      if (direction === 'top') {
        await this.page.evaluate(() => window.scrollTo(0, 0));
      } else if (direction === 'bottom') {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      } else if (direction === 'down') {
        const scrollAmount = distance ?? 500;
        await this.page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount);
      } else if (direction === 'up') {
        const scrollAmount = distance ?? 500;
        await this.page.evaluate((amount) => window.scrollBy(0, -amount), scrollAmount);
      }

      return {
        success: true,
        taskType: 'scroll',
        detail: `Scrolled ${direction}${distance ? ` by ${distance}px` : ''}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'scroll',
        detail: `Failed to scroll ${direction}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async scrollToElement(selector: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: this.config.elementTimeout });
      await this.page.locator(selector).scrollIntoViewIfNeeded();

      return {
        success: true,
        taskType: 'scroll',
        detail: `Scrolled to element: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'scroll',
        detail: `Failed to scroll to element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async hover(selector: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: this.config.elementTimeout });
      await this.page.hover(selector);

      return {
        success: true,
        taskType: 'hover',
        detail: `Hovered over element: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'hover',
        detail: `Failed to hover over element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async selectOption(selector: string, option: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: this.config.elementTimeout });
      await this.page.selectOption(selector, { label: option });

      return {
        success: true,
        taskType: 'select',
        detail: `Selected "${option}" from dropdown: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'select',
        detail: `Failed to select option from dropdown: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getText(selector: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: this.config.elementTimeout });
      const text = await this.page.textContent(selector);

      return {
        success: true,
        taskType: 'getText',
        detail: `Retrieved text from element: ${selector}`,
        data: { text: text?.trim() || '' },
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'getText',
        detail: `Failed to get text from element: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async waitForElement(selector: string, timeout?: number): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { 
        timeout: timeout ?? this.config.elementTimeout,
        state: 'visible'
      });

      return {
        success: true,
        taskType: 'wait',
        detail: `Element appeared: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'wait',
        detail: `Element did not appear: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async switchToTab(tabIndex: number): Promise<TaskResult> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    try {
      const pages = this.context.pages();
      if (tabIndex < 0 || tabIndex >= pages.length) {
        throw new Error(`Invalid tab index: ${tabIndex}. Available tabs: ${pages.length}`);
      }

      this.page = pages[tabIndex];
      await this.page.bringToFront();

      return {
        success: true,
        taskType: 'switchTab',
        detail: `Switched to tab ${tabIndex}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'switchTab',
        detail: `Failed to switch to tab ${tabIndex}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uploadFile(selector: string, filePath: string): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: this.config.elementTimeout });
      await this.page.setInputFiles(selector, filePath);

      return {
        success: true,
        taskType: 'upload',
        detail: `Uploaded file to: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'upload',
        detail: `Failed to upload file to: ${selector}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDownloadUrl(): Promise<TaskResult> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    try {
      const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
      const download = await downloadPromise;
      const url = download.url();

      return {
        success: true,
        taskType: 'download',
        detail: 'Download initiated',
        data: { downloadUrl: url },
      };
    } catch (error) {
      return {
        success: false,
        taskType: 'download',
        detail: 'Failed to capture download',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
