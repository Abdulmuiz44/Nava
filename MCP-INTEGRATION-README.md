# Nava MCP Browser Automation Backend

Complete implementation of a remote browser automation backend using Playwright MCP Server on Fly.io, integrated with Nava's Next.js application on Vercel.

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│   Nava Frontend     │
│   (Next.js/React)   │
└──────────┬──────────┘
           │
           │ HTTP Request
           ▼
┌─────────────────────┐
│  Vercel Backend     │
│  /api/automation    │
└──────────┬──────────┘
           │
           │ MCP Client
           ▼
┌─────────────────────┐
│  Fly.io MCP Server  │
│  Playwright Worker  │
└─────────────────────┘
```

## 📦 What's Included

### Part 1: Playwright MCP Server (Fly.io)

Located in `playwright-mcp-server/`:

- **package.json** - Node.js dependencies and scripts
- **server.js** - Full MCP worker with Express server
- **Dockerfile** - Production-ready container for Fly.io
- **fly.toml** - Fly.io configuration (free tier optimized)
- **DEPLOYMENT.md** - Complete deployment instructions

### Part 2: Nava Backend Integration (Vercel)

- **lib/mcpClient.ts** - HTTP client for MCP server communication
- **lib/automationService.ts** - High-level automation service
- **app/api/automation/route.ts** - Next.js API endpoint
- **hooks/useAutomation.ts** - React hooks for frontend

### Part 3: Documentation & Examples

- **examples/MCP-AUTOMATION-EXAMPLES.md** - Complete usage examples
- **MCP-INTEGRATION-README.md** - This file

## 🚀 Quick Start

### 1. Deploy MCP Server to Fly.io

```bash
cd playwright-mcp-server
flyctl launch
flyctl deploy
```

Your server will be at: `https://[your-app-name].fly.dev`

See `playwright-mcp-server/DEPLOYMENT.md` for detailed instructions.

### 2. Configure Nava Backend

Add to your `.env.local`:

```env
MCP_PLAYWRIGHT_URL=https://[your-app-name].fly.dev
```

### 3. Use in Your Application

```tsx
import { useAutomation } from '@/hooks/useAutomation';

export default function MyComponent() {
  const { runAutomation, loading, result } = useAutomation();

  const handleClick = async () => {
    await runAutomation({
      url: 'https://google.com',
      actions: [
        { type: 'type', selector: 'textarea[name="q"]', text: 'Nava' },
        { type: 'press', key: 'Enter' },
        { type: 'wait', selector: '#search', timeout: 5000 },
      ],
      screenshot: true,
    });
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Running...' : 'Search Google'}
    </button>
  );
}
```

## 📖 API Reference

### MCP Server Endpoints

#### POST /run

Execute automation tasks.

**Request:**
```json
{
  "task": {
    "instructions": [
      {
        "type": "navigate",
        "params": { "url": "https://example.com" }
      },
      {
        "type": "screenshot",
        "params": { "fullPage": false }
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "totalInstructions": 2,
    "results": [...],
    "pageUrl": "https://example.com",
    "pageTitle": "Example Domain"
  },
  "logs": [...]
}
```

#### GET /health

Check server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "activeBrowsers": 0
}
```

### Nava API Endpoints

#### POST /api/automation

Execute automation task via Nava backend.

**Request:**
```json
{
  "task": {
    "url": "https://example.com",
    "actions": [
      { "type": "screenshot", "fullPage": true }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {...},
  "pageUrl": "https://example.com",
  "pageTitle": "Example Domain",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET /api/automation

Check MCP server health.

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "message": "MCP server is healthy"
}
```

## 🎯 Supported Actions

### Navigation
- `navigate` / `goto` - Navigate to URL

### Interactions
- `click` - Click element by selector or text
- `type` / `fill` - Type text into input
- `hover` - Hover over element
- `press` - Press keyboard key
- `select` - Select dropdown option

### Waiting
- `wait` / `waitForSelector` - Wait for element to appear

### Data Extraction
- `getText` - Extract text from element
- `extractLinks` - Get all links on page
- `getContent` / `content` - Get page HTML

### Page Actions
- `scroll` - Scroll page (up/down/top/bottom)
- `screenshot` - Capture screenshot
- `evaluate` / `script` - Execute JavaScript

## 💡 Usage Examples

### Example 1: Google Search

```tsx
const { runAutomation } = useAutomation();

await runAutomation({
  url: 'https://google.com',
  actions: [
    { type: 'type', selector: 'textarea[name="q"]', text: 'Nava automation' },
    { type: 'press', key: 'Enter' },
    { type: 'wait', selector: '#search', timeout: 5000 },
    { type: 'screenshot', fullPage: false },
  ],
});
```

### Example 2: Form Submission

```tsx
await runAutomation({
  url: 'https://example.com/contact',
  actions: [
    { type: 'type', selector: '#name', text: 'John Doe' },
    { type: 'type', selector: '#email', text: 'john@example.com' },
    { type: 'type', selector: '#message', text: 'Hello!' },
    { type: 'click', selector: 'button[type="submit"]' },
    { type: 'wait', selector: '.success-message', timeout: 10000 },
  ],
  screenshot: true,
});
```

### Example 3: E-commerce Flow

```tsx
await runAutomation({
  url: 'https://shop.example.com',
  actions: [
    { type: 'type', selector: '#search', text: 'laptop' },
    { type: 'press', key: 'Enter' },
    { type: 'wait', selector: '.product-grid', timeout: 5000 },
    { type: 'scroll', direction: 'down', pixels: 800 },
    { type: 'click', selector: '.product-item:first-child' },
    { type: 'wait', selector: '.product-details', timeout: 5000 },
    { type: 'click', selector: '.add-to-cart' },
  ],
  screenshot: true,
});
```

See `examples/MCP-AUTOMATION-EXAMPLES.md` for more examples.

## 🔧 Configuration

### Environment Variables

**.env.local (Nava Backend):**
```env
# Required
MCP_PLAYWRIGHT_URL=https://your-app.fly.dev

# Optional
NODE_ENV=production
```

**Environment (MCP Server):**
```env
NODE_ENV=production
PORT=8080
```

### Fly.io Configuration

The `fly.toml` is optimized for the free tier:
- **CPU**: 1 shared vCPU
- **Memory**: 512 MB
- **Auto-stop**: Enabled (stops when idle)
- **Auto-start**: Enabled (starts on request)

### Scaling

If you need more resources:

```bash
# Increase memory
flyctl scale memory 1024

# Add regions
flyctl regions add iad fra
```

## 🛡️ Security Considerations

1. **API Authentication**: Consider adding API keys for production
2. **CORS**: Configure CORS for your frontend domain
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Always validate automation tasks
5. **Timeouts**: Set reasonable timeouts to prevent resource exhaustion

### Example: Adding API Key Authentication

In your MCP server (`server.js`):

```javascript
const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  
  const providedKey = req.headers['x-api-key'];
  if (!API_KEY || providedKey === API_KEY) {
    return next();
  }
  
  res.status(401).json({ success: false, error: 'Unauthorized' });
});
```

## 📊 Monitoring

### View Logs

```bash
# MCP Server logs (Fly.io)
flyctl logs -a your-app-name

# Real-time logs
flyctl logs -f -a your-app-name
```

### Health Checks

```bash
# Check MCP server
curl https://your-app.fly.dev/health

# Check via Nava API
curl http://localhost:3000/api/automation
```

### Metrics

Access Fly.io dashboard:
```bash
flyctl dashboard
```

## 🐛 Troubleshooting

### Issue: MCP Server Not Responding

1. Check server status:
   ```bash
   flyctl status -a your-app-name
   ```

2. View logs:
   ```bash
   flyctl logs -a your-app-name
   ```

3. Restart if needed:
   ```bash
   flyctl machine restart -a your-app-name
   ```

### Issue: Environment Variable Not Set

Ensure `MCP_PLAYWRIGHT_URL` is set in `.env.local`:

```env
MCP_PLAYWRIGHT_URL=https://your-app.fly.dev
```

Restart your Next.js dev server after changing `.env.local`.

### Issue: Timeout Errors

1. Increase timeout in `lib/mcpClient.ts`:
   ```typescript
   new MCPClient(baseUrl, { timeout: 120000 }) // 2 minutes
   ```

2. Increase Fly.io timeout in `fly.toml`:
   ```toml
   kill_timeout = 60
   ```

### Issue: Out of Memory

Increase memory allocation (may require paid plan):

```bash
flyctl scale memory 1024 -a your-app-name
```

## 💰 Cost Optimization

The free tier includes:
- 3 shared-cpu-1x machines with 256MB RAM
- 160GB/month outbound data transfer

To minimize costs:
1. Use `auto_stop_machines = true` (already configured)
2. Set `min_machines_running = 0` (already configured)
3. Optimize automation tasks to be fast and efficient
4. Cache results when possible

## 🚢 Deployment Checklist

- [ ] Deploy MCP server to Fly.io
- [ ] Set `MCP_PLAYWRIGHT_URL` in Vercel environment variables
- [ ] Test health endpoint
- [ ] Test automation endpoint
- [ ] Configure security (API keys, CORS)
- [ ] Set up monitoring and alerts
- [ ] Document custom workflows
- [ ] Test error scenarios

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Nava Repository](https://github.com/Abdulmuiz44/Nava)

## 🆘 Support

For issues:
1. Check the troubleshooting section above
2. Review logs on Fly.io and Vercel
3. Open an issue on [GitHub](https://github.com/Abdulmuiz44/Nava/issues)

## 📝 License

MIT License - See main repository for details.

---

**Made with ❤️ for the Nava Project**
