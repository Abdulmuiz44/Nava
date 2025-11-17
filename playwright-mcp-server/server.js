import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Track active browsers for cleanup
const activeBrowsers = new Set();

// Graceful shutdown handler
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close all active browsers
  const closingPromises = Array.from(activeBrowsers).map(async (browser) => {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error.message);
    }
  });
  
  await Promise.all(closingPromises);
  activeBrowsers.clear();
  
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeBrowsers: activeBrowsers.size
  });
});

// Main task execution endpoint
app.post('/run', async (req, res) => {
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    const { task } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task object is required'
      });
    }

    // Launch browser with production-ready configuration
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--safebrowsing-disable-auto-update'
      ],
      timeout: 30000
    });

    activeBrowsers.add(browser);

    // Create browser context
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Collect logs
    const logs = [];
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // Execute task based on instructions
    const result = await executeTask(page, task, logs);

    // Close browser
    await browser.close();
    activeBrowsers.delete(browser);

    res.json({
      success: true,
      result: result,
      logs: logs.slice(-100) // Return last 100 log entries
    });

  } catch (error) {
    console.error('Task execution error:', error);

    // Cleanup on error
    if (browser) {
      try {
        await browser.close();
        activeBrowsers.delete(browser);
      } catch (closeError) {
        console.error('Error closing browser after failure:', closeError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Task execution logic
async function executeTask(page, task, logs) {
  const results = [];
  const instructions = task.instructions || [];

  for (const instruction of instructions) {
    try {
      const stepResult = await executeInstruction(page, instruction);
      results.push({
        instruction: instruction.type,
        success: true,
        data: stepResult
      });
    } catch (error) {
      results.push({
        instruction: instruction.type,
        success: false,
        error: error.message
      });
      
      // Continue with other instructions even if one fails
      logs.push({
        type: 'error',
        text: `Failed instruction: ${instruction.type} - ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    totalInstructions: instructions.length,
    results: results,
    pageUrl: page.url(),
    pageTitle: await page.title()
  };
}

// Execute individual instruction
async function executeInstruction(page, instruction) {
  const { type, params } = instruction;

  switch (type) {
    case 'navigate':
    case 'goto':
      await page.goto(params.url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      return { url: page.url() };

    case 'click':
      if (params.selector) {
        await page.waitForSelector(params.selector, { timeout: 10000 });
        await page.click(params.selector);
      } else if (params.text) {
        await page.click(`text="${params.text}"`);
      }
      return { clicked: params.selector || params.text };

    case 'type':
    case 'fill':
      await page.waitForSelector(params.selector, { timeout: 10000 });
      await page.fill(params.selector, params.text);
      return { filled: params.selector };

    case 'waitForSelector':
    case 'wait':
      if (params.selector) {
        await page.waitForSelector(params.selector, { 
          timeout: params.timeout || 10000,
          state: params.state || 'visible'
        });
        return { appeared: params.selector };
      } else if (params.timeout) {
        await page.waitForTimeout(params.timeout);
        return { waited: params.timeout };
      }
      break;

    case 'evaluate':
    case 'script':
      const evalResult = await page.evaluate(params.script);
      return { result: evalResult };

    case 'getContent':
    case 'content':
      const content = await page.content();
      return { 
        content: content.substring(0, 10000), // Limit to 10KB
        length: content.length 
      };

    case 'getText':
      if (params.selector) {
        await page.waitForSelector(params.selector, { timeout: 10000 });
        const text = await page.textContent(params.selector);
        return { text: text };
      }
      break;

    case 'screenshot':
      const screenshot = await page.screenshot({ 
        type: 'png',
        fullPage: params.fullPage || false
      });
      return { 
        screenshot: screenshot.toString('base64'),
        mimeType: 'image/png'
      };

    case 'scroll':
      if (params.direction === 'down') {
        await page.evaluate((px) => window.scrollBy(0, px), params.pixels || 500);
      } else if (params.direction === 'up') {
        await page.evaluate((px) => window.scrollBy(0, -px), params.pixels || 500);
      } else if (params.direction === 'top') {
        await page.evaluate(() => window.scrollTo(0, 0));
      } else if (params.direction === 'bottom') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
      return { scrolled: params.direction };

    case 'hover':
      await page.waitForSelector(params.selector, { timeout: 10000 });
      await page.hover(params.selector);
      return { hovered: params.selector };

    case 'select':
      await page.waitForSelector(params.selector, { timeout: 10000 });
      await page.selectOption(params.selector, { label: params.option });
      return { selected: params.option };

    case 'press':
      await page.keyboard.press(params.key);
      return { pressed: params.key };

    case 'extractLinks':
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href);
      });
      return { links: links.slice(0, 100) }; // Limit to 100 links

    default:
      throw new Error(`Unknown instruction type: ${type}`);
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Nava Playwright MCP Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      run: 'POST /run'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nava Playwright MCP Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
