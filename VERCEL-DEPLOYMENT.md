# Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import your GitHub repository**

3. **⚠️ IMPORTANT: Configure Root Directory**
   Click **"Edit"** next to Root Directory and set it to:
   ```
   nava-web
   ```

4. **Configure Project Settings:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `nava-web` ⚠️ (REQUIRED)
   - **Build Command**: Leave default (`npm run build`)
   - **Install Command**: `npm install && npx playwright install chromium`
   - **Output Directory**: Leave default (`.next`)

5. **Click "Deploy"**

### Option 2: Using Vercel CLI (From nava-web directory)

```bash
# Navigate to the Next.js app directory
cd nava-web

# Deploy
vercel

# Or deploy to production
vercel --prod
```

**Note:** Always run Vercel CLI from the `nava-web` directory to avoid configuration issues.

## 📝 Important Files

- **`/.vercelignore`** - Ignores Python CLI files during deployment
- **`/nava-web/vercel.json`** - Next.js app configuration (memory, timeout for Playwright)

## 🔧 Troubleshooting

### "Could not identify Next.js version" or "Missing variable handler"

These errors occur when the **Root Directory** is not set correctly.

**Solution:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **General**
2. Find **Root Directory** section
3. Click **Edit**
4. Enter: `nava-web`
5. Click **Save**
6. Go to **Deployments** tab → Click **Redeploy**

### "No package.json found"

Make sure **Root Directory** is set to `nava-web` (see above).

### For Existing Deployments

If you already deployed and it's failing:

1. **Delete the deployment** (recommended for clean start)
   - Go to Vercel Dashboard → Your Project
   - Settings → General → Delete Project
   - Re-import from GitHub with correct Root Directory

2. **Or update settings:**
   - Settings → General → Root Directory → `nava-web`
   - Redeploy

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
