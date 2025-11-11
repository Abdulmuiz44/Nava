# ⚡ Nava - Quick Start Guide

Get your professional-grade browser automation platform running in 5 minutes!

## ✨ What's New in v2.0

🎉 **Major Features Added:**
- 🔐 API Key Authentication
- ⚡ 8 New Task Types (scroll, hover, dropdown, wait, etc.)
- 📚 Workflow Library (Save & Reuse)
- 📸 Screenshot Gallery
- 🔄 Task History with Replay
- 🎨 Enhanced Modern UI

## 📂 Two Interfaces Available

- **Web App**: Enterprise-ready Next.js interface with advanced features (at repository root)
- **CLI Tool**: Python-based command-line tool (in `nava-cli/` folder)

---

## 🌐 Web Application Quick Start

### 🎯 Deploy to Vercel in 3 Commands

```bash
pnpm install
npx playwright install chromium
vercel
```

That's it! Your app will be live at `https://your-project.vercel.app`

---

## 📦 Local Setup (Web Development)

**Note**: The web app is now at the repository root (not in a subfolder).

### 1. Install Dependencies
```bash
pnpm install
# Or: npm install
```

### 2. Install Playwright
```bash
npx playwright install chromium
```

### 3. Run Development Server
```bash
pnpm run dev
# Or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

### 4. Configure Environment (Optional)

Create `.env.local` for API security:
```bash
# .env.local
NAVA_API_KEY=your_secure_key_here
# Or set to 'none' to disable authentication
NAVA_API_KEY=none
```

### 5. Explore New Features

Once running, visit:
- **Main Page**: http://localhost:3000 - Enhanced automation interface
- **Workflows**: http://localhost:3000/workflows - Save & manage workflows
- **Screenshots**: http://localhost:3000/screenshots - View screenshot gallery

---

## 🖥️ CLI Tool Quick Start

### 1. Navigate to CLI Directory
```bash
cd nava-cli
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run CLI
```bash
python cli.py
```

For detailed CLI usage, see `nava-cli/README_PRO.md`

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

### Basic Commands
Try these in the web interface:

```
go to github.com
search for react tutorials
click login button
fill email with user@test.com
screenshot
```

### New Advanced Commands ✨
```
scroll down
scroll down 1000
hover over .menu
select "United States" from #country
get text from h1
wait for #success to appear
switch to tab 1
```

### Multi-Step Workflows
```
go to example.com, scroll down, hover over button, screenshot

go to store.com, select "Blue" from #color, click add to cart

go to form.com, fill name, wait for #confirmation, screenshot
```

### API Usage with Authentication
```bash
# With API key
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_key_here" \
  -d '{"task": "go to github.com, screenshot"}'
```

---

## 📁 Project Structure

```
Nava/
├── app/                       # Web app (Next.js)
│   ├── api/
│   │   ├── execute/           # Task execution API
│   │   ├── execute-chain/     # Chain execution API
│   │   ├── workflows/         # ✨ NEW - Workflow API
│   │   └── screenshots/       # ✨ NEW - Screenshot API
│   ├── workflows/             # ✨ NEW - Workflow page
│   ├── screenshots/           # ✨ NEW - Gallery page
│   ├── page.tsx               # Enhanced home page
│   └── layout.tsx             # Root layout
├── lib/                       # Web utilities
│   ├── browser.ts             # Enhanced browser automation
│   ├── task-executor.ts       # Enhanced task parsing
│   ├── workflow-manager.ts    # ✨ NEW - Workflow management
│   └── screenshot-manager.ts  # ✨ NEW - Screenshot management
├── middleware.ts              # ✨ NEW - API authentication
├── nava-cli/                  # Python CLI tool
├── package.json               # Web dependencies
├── vercel.json                # Deployment config (optimized)
├── FEATURES.md                # ✨ NEW - Detailed features
├── QUICK-REFERENCE.md         # ✨ NEW - Command cheat sheet
└── README.md                  # Full documentation
```

---

## 🔧 Common Issues

### Playwright Not Installing?
```bash
npx playwright install chromium
```

### Build Errors?
```bash
pnpm run build  # Check for TypeScript/ESLint errors
```

### API 401 Unauthorized?
Set `NAVA_API_KEY=none` in `.env.local` or include `x-api-key` header

### Vercel Memory Limit (Hobby Plan)?
The app is optimized for 2GB. For Pro plan, adjust `vercel.json`:
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

---

## 📚 Documentation

### 📘 User Guides
- **[README.md](README.md)**: Complete documentation
- **[FEATURES.md](FEATURES.md)**: ✨ Feature guide with examples
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)**: ✨ Command cheat sheet

### 🔧 Technical
- **[IMPLEMENTATION-COMPLETE.md](IMPLEMENTATION-COMPLETE.md)**: ✨ Technical details
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Deployment guide

### 🎯 Quick Access
- **Workflows**: http://localhost:3000/workflows
- **Screenshots**: http://localhost:3000/screenshots
- **API Docs**: In README.md

---

## 🎉 You're Ready!

Your Nava v2.0 automation platform is production-ready with:
- ✅ 26+ command types
- ✅ Workflow management
- ✅ Screenshot gallery
- ✅ Task history & replay
- ✅ API authentication
- ✅ Modern responsive UI

**Next Steps:**
1. ✅ Deploy to Vercel
2. ✅ Explore /workflows and /screenshots pages
3. ✅ Try new advanced commands (scroll, hover, select, etc.)
4. ✅ Save your first workflow
5. ✅ Set up API key for production
4. ✅ Monitor performance

**Need Help?**
- Check `DEPLOYMENT.md` for detailed instructions
- Review `README.md` for API documentation

---

Made with ❤️ using Next.js, TypeScript, Tailwind CSS, and Playwright
