# MCP Browser Automation - Example Usage

This document provides complete examples of using the Nava MCP Browser Automation system.

## Table of Contents
1. [Frontend Examples](#frontend-examples)
2. [API Examples](#api-examples)
3. [Advanced Examples](#advanced-examples)

---

## Frontend Examples

### Example 1: Basic Google Search with Screenshot

```tsx
'use client';

import { useAutomation } from '@/hooks/useAutomation';
import { useState } from 'react';

export default function GoogleSearchExample() {
  const { runAutomation, loading, result, error } = useAutomation();
  const [searchQuery, setSearchQuery] = useState('Nava browser automation');

  const handleSearch = async () => {
    await runAutomation({
      url: 'https://google.com',
      actions: [
        {
          type: 'type',
          selector: 'textarea[name="q"]',
          text: searchQuery,
        },
        {
          type: 'press',
          key: 'Enter',
        },
        {
          type: 'wait',
          selector: '#search',
          timeout: 5000,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
      ],
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Google Search Automation</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          className="w-full px-4 py-2 border rounded"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search on Google'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p className="mb-2">
            <strong>Page:</strong> {result.pageTitle}
          </p>
          <p className="mb-4">
            <strong>URL:</strong> {result.pageUrl}
          </p>

          {/* Display screenshot if available */}
          {result.result?.results?.find((r: any) => r.instruction === 'screenshot')?.data?.screenshot && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Screenshot:</h3>
              <img
                src={`data:image/png;base64,${
                  result.result.results.find((r: any) => r.instruction === 'screenshot').data.screenshot
                }`}
                alt="Search results screenshot"
                className="border rounded shadow-lg max-w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Example 2: E-commerce Product Search

```tsx
'use client';

import { useAutomation } from '@/hooks/useAutomation';
import { useState } from 'react';

export default function ProductSearchExample() {
  const { runAutomation, loading, result, error } = useAutomation();
  const [productName, setProductName] = useState('laptop');

  const searchProduct = async () => {
    await runAutomation({
      url: 'https://amazon.com',
      actions: [
        {
          type: 'type',
          selector: '#twotabsearchtextbox',
          text: productName,
        },
        {
          type: 'click',
          selector: '#nav-search-submit-button',
        },
        {
          type: 'wait',
          selector: '.s-result-item',
          timeout: 10000,
        },
        {
          type: 'scroll',
          direction: 'down',
          pixels: 800,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
      ],
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Amazon Product Search</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product name"
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <button
        onClick={searchProduct}
        disabled={loading}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
      >
        {loading ? 'Searching...' : 'Search Product'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Product Search Complete</h2>
          <p className="mb-2"><strong>Page:</strong> {result.pageTitle}</p>
          
          {result.result?.results?.find((r: any) => r.instruction === 'screenshot')?.data?.screenshot && (
            <img
              src={`data:image/png;base64,${
                result.result.results.find((r: any) => r.instruction === 'screenshot').data.screenshot
              }`}
              alt="Product search results"
              className="border rounded shadow-lg max-w-full mt-4"
            />
          )}
        </div>
      )}
    </div>
  );
}
```

### Example 3: Form Submission Automation

```tsx
'use client';

import { useAutomation } from '@/hooks/useAutomation';
import { useState } from 'react';

export default function FormSubmissionExample() {
  const { runAutomation, loading, result, error } = useAutomation();
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello from Nava!',
  });

  const submitForm = async () => {
    await runAutomation({
      url: 'https://example.com/contact',
      actions: [
        {
          type: 'type',
          selector: '#name',
          text: formData.name,
        },
        {
          type: 'type',
          selector: '#email',
          text: formData.email,
        },
        {
          type: 'type',
          selector: '#message',
          text: formData.message,
        },
        {
          type: 'click',
          selector: 'button[type="submit"]',
        },
        {
          type: 'wait',
          selector: '.success-message',
          timeout: 10000,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
      ],
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Form Submission Automation</h1>
      
      <div className="space-y-4 mb-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Message"
          className="w-full px-4 py-2 border rounded"
          rows={4}
        />
      </div>

      <button
        onClick={submitForm}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Submitting...' : 'Submit Form'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="text-xl font-semibold mb-2">✓ Form Submitted Successfully</h2>
          <p className="mb-2"><strong>Page:</strong> {result.pageTitle}</p>
        </div>
      )}
    </div>
  );
}
```

---

## API Examples

### Example 1: Direct API Call (cURL)

```bash
# Search on Google
curl -X POST http://localhost:3000/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "url": "https://google.com",
      "actions": [
        {
          "type": "type",
          "selector": "textarea[name=\"q\"]",
          "text": "Nava automation"
        },
        {
          "type": "press",
          "key": "Enter"
        },
        {
          "type": "wait",
          "selector": "#search",
          "timeout": 5000
        }
      ],
      "screenshot": true
    }
  }'
```

### Example 2: Node.js/TypeScript API Call

```typescript
async function searchGoogle(query: string) {
  const response = await fetch('http://localhost:3000/api/automation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: {
        url: 'https://google.com',
        actions: [
          {
            type: 'type',
            selector: 'textarea[name="q"]',
            text: query,
          },
          {
            type: 'press',
            key: 'Enter',
          },
          {
            type: 'wait',
            selector: '#search',
            timeout: 5000,
          },
        ],
        screenshot: true,
      },
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Search completed:', data.pageTitle);
    
    // Get screenshot from results
    const screenshotData = data.result.results.find(
      (r: any) => r.instruction === 'screenshot'
    )?.data?.screenshot;
    
    if (screenshotData) {
      // Save screenshot or process it
      console.log('Screenshot captured');
    }
  } else {
    console.error('Search failed:', data.error);
  }
  
  return data;
}

// Usage
searchGoogle('Nava browser automation');
```

### Example 3: Python API Call

```python
import requests
import base64
from pathlib import Path

def search_and_screenshot(query: str):
    url = 'http://localhost:3000/api/automation'
    
    payload = {
        'task': {
            'url': 'https://google.com',
            'actions': [
                {
                    'type': 'type',
                    'selector': 'textarea[name="q"]',
                    'text': query
                },
                {
                    'type': 'press',
                    'key': 'Enter'
                },
                {
                    'type': 'wait',
                    'selector': '#search',
                    'timeout': 5000
                }
            ],
            'screenshot': True
        }
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data.get('success'):
        print(f"Search completed: {data.get('pageTitle')}")
        
        # Extract and save screenshot
        results = data.get('result', {}).get('results', [])
        screenshot_result = next(
            (r for r in results if r.get('instruction') == 'screenshot'),
            None
        )
        
        if screenshot_result and screenshot_result.get('data', {}).get('screenshot'):
            screenshot_base64 = screenshot_result['data']['screenshot']
            screenshot_bytes = base64.b64decode(screenshot_base64)
            
            # Save to file
            Path('screenshot.png').write_bytes(screenshot_bytes)
            print('Screenshot saved to screenshot.png')
    else:
        print(f"Search failed: {data.get('error')}")
    
    return data

# Usage
search_and_screenshot('Nava browser automation')
```

---

## Advanced Examples

### Example 4: Multi-Step E-commerce Flow

```tsx
'use client';

import { useAutomation } from '@/hooks/useAutomation';
import { useState } from 'react';

export default function EcommerceFlowExample() {
  const { runAutomation, loading, result } = useAutomation();
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const completeShoppingFlow = async () => {
    const shopResult = await runAutomation({
      url: 'https://example-shop.com',
      actions: [
        // Step 1: Search for product
        {
          type: 'type',
          selector: '#search-input',
          text: 'wireless headphones',
        },
        {
          type: 'press',
          key: 'Enter',
        },
        {
          type: 'wait',
          selector: '.product-grid',
          timeout: 5000,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
        // Step 2: Click first product
        {
          type: 'click',
          selector: '.product-item:first-child',
        },
        {
          type: 'wait',
          selector: '.product-details',
          timeout: 5000,
        },
        {
          type: 'scroll',
          direction: 'down',
          pixels: 500,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
        // Step 3: Add to cart
        {
          type: 'click',
          selector: '.add-to-cart-button',
        },
        {
          type: 'wait',
          selector: '.cart-confirmation',
          timeout: 5000,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
      ],
    });

    // Extract all screenshots
    if (shopResult.success && shopResult.result) {
      const screenshotResults = shopResult.result.results.filter(
        (r: any) => r.instruction === 'screenshot' && r.success
      );
      const screenshotImages = screenshotResults.map(
        (r: any) => r.data.screenshot
      );
      setScreenshots(screenshotImages);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">E-commerce Shopping Flow</h1>

      <button
        onClick={completeShoppingFlow}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        {loading ? 'Running Flow...' : 'Start Shopping Flow'}
      </button>

      {screenshots.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow">
              <div className="bg-gray-100 px-3 py-2">
                <p className="text-sm font-semibold">Step {index + 1}</p>
              </div>
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt={`Step ${index + 1}`}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 5: Data Extraction

```tsx
'use client';

import { useAutomation } from '@/hooks/useAutomation';
import { useState } from 'react';

export default function DataExtractionExample() {
  const { runAutomation, loading, result } = useAutomation();
  const [extractedData, setExtractedData] = useState<any>(null);

  const extractData = async () => {
    const extractResult = await runAutomation({
      url: 'https://news.ycombinator.com',
      actions: [
        {
          type: 'wait',
          selector: '.titleline',
          timeout: 5000,
        },
        {
          type: 'screenshot',
          fullPage: false,
        },
      ],
      extractLinks: true,
    });

    if (extractResult.success && extractResult.result) {
      const linksResult = extractResult.result.results.find(
        (r: any) => r.instruction === 'extractLinks'
      );
      
      if (linksResult && linksResult.data) {
        setExtractedData(linksResult.data);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Data Extraction Example</h1>

      <button
        onClick={extractData}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
      >
        {loading ? 'Extracting...' : 'Extract Links from HN'}
      </button>

      {extractedData && extractedData.links && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Extracted {extractedData.links.length} Links
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-2">
              {extractedData.links.slice(0, 20).map((link: string, index: number) => (
                <li key={index} className="border-b pb-2">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Health Check Example

```tsx
'use client';

import { useMCPHealth } from '@/hooks/useAutomation';
import { useEffect } from 'react';

export default function HealthCheckExample() {
  const { checkHealth, loading, healthy, error } = useMCPHealth();

  useEffect(() => {
    // Check health on mount
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">MCP Server Status</h1>

      <div className="border rounded-lg p-4">
        {loading && <p className="text-gray-600">Checking...</p>}
        
        {!loading && healthy && (
          <div className="flex items-center text-green-600">
            <span className="text-2xl mr-2">✓</span>
            <div>
              <p className="font-semibold">Server is healthy</p>
              <p className="text-sm text-gray-600">Ready to accept automation tasks</p>
            </div>
          </div>
        )}
        
        {!loading && healthy === false && (
          <div className="flex items-center text-red-600">
            <span className="text-2xl mr-2">✗</span>
            <div>
              <p className="font-semibold">Server is unavailable</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={checkHealth}
        disabled={loading}
        className="mt-4 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 w-full"
      >
        {loading ? 'Checking...' : 'Check Again'}
      </button>
    </div>
  );
}
```

---

## Environment Setup

Make sure to set the MCP server URL in your `.env.local`:

```env
# MCP Playwright Server URL (from your Fly.io deployment)
MCP_PLAYWRIGHT_URL=https://nava-playwright-mcp.fly.dev
```

---

## Tips for Best Results

1. **Wait for Elements**: Always use `wait` actions before interacting with dynamic content
2. **Specific Selectors**: Use specific CSS selectors to avoid ambiguity
3. **Error Handling**: Always check for `success` in results and handle errors gracefully
4. **Screenshots**: Take screenshots at key steps for debugging
5. **Timeouts**: Adjust timeouts based on page load times
6. **Testing**: Test automation flows in development before production use

---

For more examples and documentation, visit: [Nava Documentation](https://github.com/Abdulmuiz44/Nava)
