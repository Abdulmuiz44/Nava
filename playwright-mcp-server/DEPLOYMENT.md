# Nava Playwright MCP Server - Fly.io Deployment Guide

This guide will help you deploy the Nava Playwright MCP Server to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Flyctl CLI**: Install the Fly.io CLI tool
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```
3. **Login to Fly.io**:
   ```bash
   flyctl auth login
   ```

## Deployment Steps

### Step 1: Navigate to the MCP Server Directory

```bash
cd playwright-mcp-server
```

### Step 2: Launch the Application

This will create your Fly.io app and configure it:

```bash
flyctl launch
```

**Important Configuration Choices:**
- **App Name**: Use `nava-playwright-mcp` (or choose your own unique name)
- **Region**: Choose closest to your Vercel deployment (e.g., `lax` for Los Angeles, `iad` for US East)
- **Would you like to set up a Postgresql database?**: **No**
- **Would you like to set up an Upstash Redis database?**: **No**
- **Would you like to deploy now?**: **Yes** (or deploy manually in Step 3)

The `fly.toml` file is already configured, so flyctl will use it automatically.

### Step 3: Deploy the Application

If you chose not to deploy during launch, or for subsequent deployments:

```bash
flyctl deploy
```

This will:
1. Build the Docker image
2. Push it to Fly.io's registry
3. Deploy it to your chosen region
4. Start the application

### Step 4: Verify Deployment

Check if your app is running:

```bash
flyctl status
```

Test the health endpoint:

```bash
flyctl open /health
```

Or use curl:

```bash
curl https://nava-playwright-mcp.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "activeBrowsers": 0
}
```

### Step 5: Get Your API URL

Your Playwright MCP Server will be available at:

```
https://[your-app-name].fly.dev
```

Example:
```
https://nava-playwright-mcp.fly.dev/run
```

**Save this URL** - you'll need it for the Nava backend configuration.

## Configuration

### Environment Variables

Set environment variables if needed:

```bash
flyctl secrets set NODE_ENV=production
```

### Scaling

The free tier is configured with:
- **CPU**: 1 shared CPU
- **Memory**: 512 MB
- **Auto-stop**: Machines stop when idle
- **Auto-start**: Machines start on request

To scale if needed:

```bash
# Scale memory
flyctl scale memory 1024

# Scale to multiple regions
flyctl regions add iad
```

## Testing Your Deployment

### Test the /run Endpoint

```bash
curl -X POST https://nava-playwright-mcp.fly.dev/run \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "instructions": [
        {
          "type": "navigate",
          "params": {
            "url": "https://example.com"
          }
        },
        {
          "type": "screenshot",
          "params": {
            "fullPage": false
          }
        }
      ]
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "result": {
    "totalInstructions": 2,
    "results": [
      {
        "instruction": "navigate",
        "success": true,
        "data": {
          "url": "https://example.com/"
        }
      },
      {
        "instruction": "screenshot",
        "success": true,
        "data": {
          "screenshot": "iVBORw0KGgo...",
          "mimeType": "image/png"
        }
      }
    ],
    "pageUrl": "https://example.com/",
    "pageTitle": "Example Domain"
  },
  "logs": []
}
```

## Monitoring

### View Logs

```bash
# Real-time logs
flyctl logs

# Follow logs
flyctl logs -f
```

### View Metrics

```bash
flyctl dashboard
```

### Check Machine Status

```bash
flyctl machines list
```

## Troubleshooting

### Issue: Deployment Fails

1. Check logs:
   ```bash
   flyctl logs
   ```

2. Verify Docker builds locally:
   ```bash
   docker build -t test-build .
   docker run -p 8080:8080 test-build
   ```

### Issue: Out of Memory

Increase memory allocation (may require paid plan):

```bash
flyctl scale memory 1024
```

### Issue: Timeouts

Playwright tasks can be resource-intensive. If you experience timeouts:

1. Optimize your automation tasks
2. Consider upgrading to a larger VM size
3. Reduce concurrent requests in `fly.toml`

### Issue: Browser Won't Launch

Ensure Chromium dependencies are properly installed in the Dockerfile. The provided Dockerfile includes all necessary dependencies.

## Updating Your Deployment

After making changes to the code:

```bash
flyctl deploy
```

This will rebuild and redeploy your application.

## Cost Management

The free tier includes:
- 3 shared-cpu-1x machines with 256MB RAM
- 160GB/month outbound data transfer

To stay within the free tier:
- Use `auto_stop_machines = true` (already configured)
- Set `min_machines_running = 0` (already configured)
- Monitor your usage: `flyctl dashboard`

## Integration with Nava Backend

After deployment, update your Nava backend's environment variables:

1. Create or update `.env.local` in your Nava project root:
   ```env
   MCP_PLAYWRIGHT_URL=https://nava-playwright-mcp.fly.dev
   ```

2. Restart your Vercel deployment or local development server

3. Test the integration using the `/api/automation` endpoint

## Support

For Fly.io specific issues:
- Documentation: https://fly.io/docs
- Community: https://community.fly.io
- Status: https://status.fly.io

For Nava issues:
- GitHub: https://github.com/Abdulmuiz44/Nava

## Advanced Configuration

### Custom Domain

Add a custom domain:

```bash
flyctl certs create yourdomain.com
```

### Multiple Regions

Deploy to multiple regions for better performance:

```bash
flyctl regions add lax iad fra
```

### Persistent Storage

If you need persistent storage (not typically needed for this service):

```bash
flyctl volumes create data --size 1
```

## Security Best Practices

1. **Keep Dependencies Updated**: Regularly update npm packages
2. **Monitor Logs**: Watch for suspicious activity
3. **Rate Limiting**: Consider adding rate limiting middleware
4. **API Keys**: Add authentication if exposing to public internet
5. **CORS**: Configure CORS appropriately for your frontend domain

## Next Steps

1. Copy your API URL: `https://[your-app-name].fly.dev`
2. Proceed to Part 2 of the setup: Integrate with Nava Backend
3. Configure environment variables in your Vercel deployment
4. Test the complete automation workflow

---

**Congratulations!** Your Playwright MCP Server is now running on Fly.io. 🚀
