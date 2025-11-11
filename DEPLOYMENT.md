# 🚀 Nava Web - Vercel Deployment Guide

Complete guide to deploying your Nava browser automation platform to Vercel.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18.17+ installed
- [ ] GitHub/GitLab/Bitbucket account
- [ ] Vercel account (free tier works)
- [ ] Code pushed to git repository

## 🎯 Quick Deploy (3 Steps)

### Step 1: Prepare Your Repository

```bash
cd nava-web
git init
git add .
git commit -m "Initial commit: Nava Web"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your git provider
4. Choose the `nava-web` repository

### Step 3: Configure & Deploy

Vercel will auto-detect Next.js. Just click **"Deploy"**!

The `vercel.json` file handles all configuration automatically.

## 🔧 Manual Configuration (If Needed)

If auto-detection doesn't work:

### Build Settings
```
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install && npx playwright install chromium
Output Directory: .next
```

### Environment Variables
No environment variables required for basic deployment.

Optional:
```
NODE_ENV=production
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
```

## 🌐 Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

**Easiest and most visual way**

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel detects Next.js automatically
4. Click "Deploy" (that's it!)

**Deployment URL**: `https://your-project.vercel.app`

---

### Method 2: Vercel CLI

**For developers who prefer terminal**

Install Vercel CLI:
```bash
npm i -g vercel
```

Login:
```bash
vercel login
```

Deploy to preview:
```bash
vercel
```

Deploy to production:
```bash
vercel --prod
```

---

### Method 3: GitHub Actions (CI/CD)

**For automated deployments**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Vercel CLI
        run: npm install -g vercel
        
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Add secrets in GitHub repository settings:
- `VERCEL_TOKEN`: Get from [vercel.com/account/tokens](https://vercel.com/account/tokens)

---

## ⚙️ Advanced Configuration

### Custom Domain

1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Performance Optimization

Edit `vercel.json` for more memory:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 300
    }
  }
}
```

**Memory options**: 1024, 3008 (Pro), 5120 (Pro)
**Max duration**: 10s (Hobby), 300s (Pro), 900s (Enterprise)

### Environment-Specific Settings

Create multiple environments:

```bash
# Development
vercel

# Staging
vercel --target staging

# Production
vercel --prod
```

---

## 🧪 Testing Your Deployment

### 1. Health Check

Visit your deployment URL:
```
https://your-project.vercel.app
```

You should see the Nava interface.

### 2. API Test

Test the execute endpoint:

```bash
curl -X POST https://your-project.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "go to github.com", "headless": true}'
```

Expected response:
```json
{
  "success": true,
  "result": {
    "success": true,
    "taskType": "navigation",
    "detail": "Navigated to https://github.com"
  }
}
```

### 3. Task Chain Test

```bash
curl -X POST https://your-project.vercel.app/api/execute-chain \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": ["go to github.com", "extract links"],
    "headless": true
  }'
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Automatically enabled! View at:
```
https://vercel.com/your-username/nava-web/analytics
```

### Function Logs

View real-time logs:
```bash
vercel logs
```

Or in dashboard:
```
Project → Deployments → [Select Deployment] → Runtime Logs
```

### Performance Monitoring

Check metrics:
- Response time
- Error rate
- Invocation count
- Memory usage

---

## 🔒 Security Best Practices

### 1. Add Rate Limiting

Install middleware:
```bash
npm install @upstash/ratelimit @upstash/redis
```

Add to API routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### 2. Add Authentication

Use Vercel Edge Config for API keys:

```typescript
if (request.headers.get('x-api-key') !== process.env.API_KEY) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 3. CORS Configuration

In `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
      ],
    },
  ];
}
```

---

## 🐛 Troubleshooting

### Issue: Playwright Not Working

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**: Ensure install command includes Playwright:
```
npm install && npx playwright install chromium
```

In Vercel dashboard:
1. Settings → General → Build & Development Settings
2. Install Command: `npm install && npx playwright install chromium`

---

### Issue: Function Timeout

**Error**: `Task timed out after 10 seconds`

**Solution**: Upgrade to Vercel Pro for 300s timeout, or optimize:

```typescript
// Increase timeout in vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  }
}
```

---

### Issue: Out of Memory

**Error**: `JavaScript heap out of memory`

**Solution**: Increase memory allocation:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008
    }
  }
}
```

---

### Issue: Cold Start Times

**Problem**: First request is slow

**Solutions**:
1. Use Vercel Pro for faster cold starts
2. Implement warming strategy:

```typescript
// Add a warmup endpoint
export async function GET() {
  return Response.json({ status: 'warm' });
}
```

Set up cron job to ping it:
```
https://cron-job.org/
```

---

## 📈 Scaling Considerations

### Hobby Plan (Free)
- ✅ Perfect for testing
- ✅ 100GB bandwidth
- ❌ 10s function timeout
- ❌ 1GB memory

### Pro Plan ($20/month)
- ✅ 300s function timeout
- ✅ 3GB memory
- ✅ Priority support
- ✅ Better performance

### Enterprise
- ✅ 900s function timeout
- ✅ Custom memory limits
- ✅ SLA guarantees

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- **Push to main**: Production deployment
- **Pull requests**: Preview deployments
- **Push to branches**: Development deployments

### Preview Deployments

Every PR gets a unique URL:
```
https://nava-web-git-feature-name.vercel.app
```

---

## 📱 Post-Deployment Checklist

After successful deployment:

- [ ] Test main page loads
- [ ] Test single task execution
- [ ] Test task chain execution
- [ ] Check function logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure analytics
- [ ] Set up monitoring alerts
- [ ] Add rate limiting
- [ ] Document API endpoints
- [ ] Share deployment URL

---

## 🎉 Success!

Your Nava automation platform is now live on Vercel!

**Next Steps:**
1. Share your deployment URL
2. Monitor performance in Vercel dashboard
3. Set up custom domain
4. Add security features
5. Scale as needed

**Deployment URL Pattern:**
```
https://[project-name]-[user-name].vercel.app
```

**Example:**
```
https://nava-web-abdulmuiz44.vercel.app
```

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Playwright Docs**: [playwright.dev](https://playwright.dev)

---

## 🚀 Ready to Deploy?

```bash
cd nava-web
vercel
```

That's it! Your automation platform will be live in seconds! 🎊
