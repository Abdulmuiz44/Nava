# ⚡ Nava Web - Quick Start Guide

Get your browser automation platform running in 5 minutes!

## 🎯 Deploy to Vercel in 3 Commands

```bash
cd nava-web
npm install
vercel
```

That's it! Your app will be live at `https://your-project.vercel.app`

---

## 📦 Local Setup (Development)

### 1. Install Dependencies
```bash
cd nava-web
npm install
```

### 2. Install Playwright
```bash
npx playwright install chromium
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🌐 Deploy to Production

### Option A: Vercel Dashboard (Easiest)

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click "Deploy"

### Option B: Vercel CLI (Fastest)

```bash
npm i -g vercel  # Install CLI
vercel login     # Login
vercel --prod    # Deploy
```

---

## 🧪 Test Your Deployment

### Test in Browser
Visit: `https://your-project.vercel.app`

### Test API
```bash
curl -X POST https://your-project.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "go to github.com"}'
```

---

## 💡 Example Commands

Try these in the web interface:

```
go to github.com
search for react tutorials
go to google.com
extract links
```

---

## 📁 Project Structure

```
nava-web/
├── app/
│   ├── api/              # API routes
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── browser.ts        # Browser automation
│   └── task-executor.ts  # Task parsing
├── package.json          # Dependencies
└── vercel.json           # Deployment config
```

---

## 🔧 Common Issues

### Playwright Not Installing?
```bash
npx playwright install --with-deps chromium
```

### Function Timeout?
Upgrade to Vercel Pro for 300s timeout

### Out of Memory?
Increase memory in `vercel.json`:
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

## 📚 Documentation

- **Full README**: `README.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **API Docs**: In README.md

---

## 🎉 You're Ready!

Your Nava automation platform is production-ready!

**Next Steps:**
1. ✅ Deploy to Vercel
2. ✅ Test automation tasks
3. ✅ Add custom domain (optional)
4. ✅ Monitor performance

**Need Help?**
- Check `DEPLOYMENT.md` for detailed instructions
- Review `README.md` for API documentation

---

Made with ❤️ using Next.js, TypeScript, Tailwind CSS, and Playwright
