# Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import your GitHub repository**

3. **Configure Project Settings:**
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave as `.` (root) - the vercel.json will handle it
   - **Build Command**: `cd nava-web && npm run build`
   - **Install Command**: `cd nava-web && npm install && npx playwright install chromium`
   - **Output Directory**: `nava-web/.next`

4. **Click "Deploy"**

### Option 2: Using Vercel CLI

```bash
# Make sure you're in the root directory
cd /path/to/Nava

# Deploy
vercel

# Or deploy to production
vercel --prod
```

The `vercel.json` at the root will automatically configure the build to use the `nava-web` folder.

## 📝 Important Files

- **`/vercel.json`** - Root configuration that tells Vercel to build from `nava-web`
- **`/.vercelignore`** - Ignores Python CLI files during deployment
- **`/nava-web/vercel.json`** - Next.js app-specific configuration (memory, timeout)

## 🔧 Troubleshooting

### "Missing variable handler or app in file main.py"

This error occurs when Vercel tries to deploy the Python CLI files instead of the Next.js app.

**Solution:**
1. Make sure the root `vercel.json` exists (it should)
2. Make sure `.vercelignore` exists (it should)
3. Redeploy from Vercel dashboard with the settings above
4. Or use the CLI from the root directory

### If Deployment Still Fails

**Alternative Method: Deploy from nava-web subdirectory**

1. In Vercel Dashboard → Project Settings → General
2. Set **Root Directory** to `nava-web`
3. Set **Framework Preset** to Next.js
4. Set **Build Command** to `npm run build`
5. Set **Install Command** to `npm install && npx playwright install chromium`
6. Redeploy

## 🎯 Verify Deployment

After deployment, your app should be available at:
```
https://your-project-name.vercel.app
```

Test it with:
```
go to github.com
```

## 📚 More Information

See detailed deployment guide: [nava-web/DEPLOYMENT.md](nava-web/DEPLOYMENT.md)
