# 🔧 Vercel Deployment Fix

## Problem
Vercel errors:
- `Missing variable 'handler' or 'app' in file "main.py"`
- `Could not identify Next.js version`

**Root Cause:** Vercel is looking at the root directory which contains Python files, not the Next.js app in `nava-web` folder.

## Solution
Set **Root Directory** to `nava-web` in Vercel Dashboard.

### Files Created:
1. **`/.vercelignore`** - Ignores Python files during deployment
2. **`/VERCEL-DEPLOYMENT.md`** - Detailed deployment guide

### Files Updated:
1. **`/README.md`** - Added deployment warning

## 🚀 Fix Steps (Do This Now!)

### Step 1: Go to Vercel Dashboard

1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **Nava** project

### Step 2: Update Root Directory

1. Click **Settings** (top menu)
2. Click **General** (left sidebar)
3. Scroll down to **Root Directory**
4. Click **Edit**
5. Enter: `nava-web`
6. Click **Save**

### Step 3: Redeploy

1. Click **Deployments** tab (top menu)
2. Find the latest deployment
3. Click **"..."** menu → **Redeploy**
4. Wait for build to complete (2-3 minutes)

### Alternative: Fresh Start (Recommended if issues persist)

1. **Delete the project:**
   - Settings → General → Scroll to bottom
   - Click **Delete Project**
   - Confirm deletion

2. **Re-import:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - ⚠️ **IMPORTANT:** Set **Root Directory** to `nava-web`
   - Click Deploy

## ✅ Verify Deployment

After deployment, test:
```
https://your-project.vercel.app
```

Try command:
```
go to github.com
```

## 📚 More Help

See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for detailed instructions.
