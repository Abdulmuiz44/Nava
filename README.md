# Nava - Intelligent Browser Automation Platform

A professional-grade browser automation platform with both web and CLI interfaces. Built with Next.js 14, TypeScript, React, Tailwind CSS, Playwright, and Python.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Abdulmuiz44/Nava)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-green.svg)](https://playwright.dev)

## 📂 Project Structure

This repository contains two main components:

- **Web Application** (Root): Enterprise-ready Next.js web interface with advanced features
- **CLI Tool** (`nava-cli/`): Python-based command-line interface for browser automation

Choose the interface that best fits your workflow!

## ✨ What's New in v2.0

🎉 **Major Update**: Nava has been transformed into a professional-grade automation platform!

### 🆕 New Features
- 🔐 **API Key Authentication** - Secure your instance with optional API keys
- ⚡ **8 New Task Types** - Scroll, hover, dropdown selection, text extraction, smart waits, tab switching, file upload, downloads
- 📚 **Workflow Library** - Save, manage, and reuse automation workflows
- 📸 **Screenshot Gallery** - Automatic screenshot management with visual gallery
- 🔄 **Task History & Replay** - Persistent command history with one-click replay
- 🎨 **Enhanced UI** - Modern navigation, better feedback, mobile responsive
- 🛡️ **Production Ready** - TypeScript strict mode, comprehensive error handling, optimized builds

## 🚀 Features

### Web Interface Features
- **Modern Navigation Bar**: Quick access to Workflows, Screenshots, and Documentation
- **Beautiful UI**: Responsive interface with Tailwind CSS and modern design
- **Real-time Execution**: Instant task execution with live feedback
- **Workflow Management**: Save and reuse complex automation sequences
- **Screenshot Gallery**: Visual gallery with lightbox, download, and metadata
- **Task History**: Persistent history with replay functionality
- **API Security**: Optional API key authentication for production deployments
- **RESTful API**: Comprehensive API endpoints for programmatic access
- **Vercel Ready**: Optimized for serverless deployment
- **TypeScript**: Fully typed codebase with strict mode enabled

### CLI Features  
- **Python-Based**: Powerful command-line automation tool
- **Rich Terminal UI**: Interactive command-line interface
- **Scheduling**: Automate tasks with built-in scheduler
- **Workflow Management**: Create and execute complex automation workflows
- **Integration Support**: Extensible integration system

### Core Automation Features (Both Interfaces)
- **Natural Language Commands**: Control browsers with simple English (26+ command types)
- **Smart Text-Based Clicking**: Click buttons and links by their visible text
- **Intelligent Form Filling**: Fill forms by field labels automatically
- **Multi-Step Workflows**: Chain multiple commands with comma separation
- **Advanced Interactions**: Scroll, hover, select dropdowns, extract text, smart waits
- **Tab Management**: Switch between browser tabs
- **File Operations**: Upload files and capture downloads
- **Visible/Headless Toggle**: Watch automation or run in background
- **Playwright Integration**: Robust browser automation powered by Playwright

## 🤖 Browser Use Integration (NEW!)

Nava now supports **Browser Use** - an AI-powered browser automation agent that can execute complex tasks using natural language!

### Key Features
- **AI-Driven Automation**: Use LLMs (Claude, GPT-4, or Ollama) to intelligently navigate and interact with websites
- **Mobile Emulation**: Simulate iPhone, Pixel, iPad devices with touch events and mobile viewports
- **Smart Fallback**: Automatically falls back to Playwright if Browser Use is unavailable or fails
- **Zero Configuration**: Works with or without API keys (supports local Ollama)
- **Secure by Default**: API keys via environment variables, sandboxed execution

### Supported LLM Providers
1. **Anthropic Claude** (Recommended) - Best reasoning capabilities
2. **OpenAI GPT-4** - Great performance and reliability
3. **Ollama** (Local) - Free, runs on your machine, no API key needed

### Quick Setup

#### 1. Install Browser Use Dependencies
```bash
cd nava-cli
pip install -r requirements.txt
```

#### 2. Configure LLM (Optional)
Create a `.env` file or set environment variables:

```bash
# For Anthropic Claude (recommended)
export USE_BROWSER_USE=true
export ANTHROPIC_API_KEY=your_api_key_here

# OR for OpenAI
export USE_BROWSER_USE=true
export OPENAI_API_KEY=your_api_key_here

# OR for Ollama (local, free - no API key needed)
export USE_BROWSER_USE=true
# Ollama will auto-detect if running at http://localhost:11434
```

#### 3. Enable Mobile Emulation (Optional)
```bash
export ENABLE_MOBILE_EMULATION=true
export MOBILE_DEVICE="iPhone 13 Pro"  # Options: iPhone 13 Pro, Pixel 7, iPad Pro
```

### Using Browser Use

#### Via Python CLI
```bash
# Set environment variable
export USE_BROWSER_USE=true

# Run a task
python nava-cli/test_browser_use.py --task "go to github.com and search for browser automation"

# Run with mobile emulation
python nava-cli/test_browser_use.py --task "scroll down on mobile twitter.com" --mobile

# Run all integration tests
python nava-cli/test_browser_use.py --all
```

#### Via API Server
```bash
# Start the Python API server
cd nava-cli
python api_server.py
```

Then send requests with Browser Use enabled:
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "go to example.com and take a screenshot",
    "use_browser_use": true,
    "mobile": false,
    "headless": true
  }'
```

#### Via Next.js Web API
The web API automatically proxies to the Python backend when `useBrowserUse` is enabled:

```javascript
// Frontend code
const response = await fetch('/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: "Search for AI agents on GitHub",
    useBrowserUse: true,
    mobile: false,
    headless: true
  })
});
```

### Browser Use vs Playwright

| Feature | Browser Use | Playwright |
|---------|-------------|------------|
| AI-Driven | ✅ Yes | ❌ No |
| Natural Language | ✅ Advanced | ✅ Basic |
| Complex Reasoning | ✅ Yes | ❌ Limited |
| Speed | 🟡 Moderate | ✅ Fast |
| API Keys Required | 🟡 Optional | ✅ None |
| Mobile Emulation | ✅ Yes | ✅ Yes |
| Reliability | ✅ High (with fallback) | ✅ Very High |

**Best Practice**: Enable Browser Use for complex, multi-step tasks that require reasoning. Use Playwright for simple, fast operations.

### Security & Best Practices

1. **API Keys**: Store in `.env` file, never commit to version control
2. **Rate Limiting**: Browser Use respects LLM provider rate limits
3. **Timeout**: Tasks automatically timeout after 60 seconds
4. **Sandboxing**: All executions run in isolated browser contexts
5. **Fallback**: System automatically falls back to Playwright on errors

### Troubleshooting

**Browser Use not working?**
- Check `USE_BROWSER_USE=true` is set
- Verify API key is configured (or Ollama is running)
- Check logs: `tail -f nava-cli/*.log`
- Test with: `python nava-cli/test_browser_use.py --all`

**No LLM provider available?**
Install Ollama for free local LLM:
```bash
# Install Ollama (https://ollama.ai)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3

# Ollama will auto-start at http://localhost:11434
```

## 📋 Prerequisites

### For Web Application
- Node.js 18.17.0 or higher
- pnpm, npm, or yarn package manager
- Vercel account (optional, for deployment)

### For CLI Tool
- Python 3.8 or higher
- pip package manager

## 🛠️ Quick Start

### Web Application (Next.js)

The web application is now at the **root** of the repository.

#### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

#### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

#### 3. Run Development Server

```bash
pnpm run dev
# Or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### CLI Tool (Python)

The CLI tool is located in the `nava-cli/` directory.

#### 1. Navigate to CLI Directory

```bash
cd nava-cli
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Run CLI

```bash
python cli.py
```

For detailed CLI documentation, see `nava-cli/README_PRO.md`

## 📦 Build for Production (Web App)

```bash
pnpm run build
pnpm start
# Or: npm run build && npm start
```

## 🌐 Deploy to Vercel (Web App)

**Important**: The web application is now at the repository root, so deployment is simpler.

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the repository root:
```bash
vercel
```

For production deployment:
```bash
vercel --prod
```

### Method 2: GitHub Integration (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js configuration
6. Configure build settings (optional):
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `pnpm run build` or `npm run build`
   - **Install Command**: `pnpm install && npx playwright install chromium`
7. Click "Deploy"

### Method 3: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js from the root
4. Add build settings if needed:
   ```
   Build Command: pnpm run build
   Install Command: pnpm install && npx playwright install chromium
   ```
5. Deploy

**Note**: The `vercel.json` configuration is already set up at the repository root.

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Node Environment
NODE_ENV=production

# Playwright Configuration
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# API Security (set to 'none' to disable authentication)
NAVA_API_KEY=your_secure_api_key_here

# Optional: Rate Limiting
MAX_REQUESTS_PER_MINUTE=60

# Optional: Browser Configuration
DEFAULT_TIMEOUT=30000
MAX_CONCURRENT_SESSIONS=5

# Optional: Features
ENABLE_SCREENSHOTS=true
ENABLE_FILE_UPLOAD=true
```

### Vercel Configuration

The `vercel.json` file is pre-configured with:
- Optimized memory (2GB) for Hobby plan compatibility
- Extended timeout (60s) for automation tasks
- Playwright Chromium installation
- Environment variable management

**Note**: For production deployments requiring longer timeouts or more memory, consider upgrading to Vercel Pro plan.

## 🎯 Which Interface Should You Use?

### Use the **Web Application** if you:
- Want a visual interface with real-time feedback
- Need to deploy on Vercel or other serverless platforms
- Prefer TypeScript/JavaScript ecosystem
- Want easy API access for integrations
- Need a production-ready web UI

### Use the **CLI Tool** if you:
- Prefer command-line interfaces
- Need advanced scheduling capabilities
- Want local Python-based automation
- Need workflow management features
- Want to integrate with Python scripts

**Both interfaces share the same core automation features!**

## 📚 API Documentation (Web App)

### Authentication

All API endpoints support optional API key authentication via the `x-api-key` header:

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"task": "go to github.com"}'
```

Set `NAVA_API_KEY=none` in `.env.local` to disable authentication.

### Execute Single Task

**Endpoint**: `POST /api/execute`

**Headers**:
```
Content-Type: application/json
x-api-key: your_api_key (if authentication enabled)
```

**Request Body**:
```json
{
  "task": "go to github.com, scroll down, screenshot",
  "headless": true
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "success": true,
    "taskType": "screenshot",
    "detail": "Screenshot captured successfully",
    "data": {
      "screenshot": "base64_encoded_image...",
      "pageUrl": "https://github.com"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Execute Task Chain

**Endpoint**: `POST /api/execute-chain`

**Headers**:
```
Content-Type: application/json
x-api-key: your_api_key (if authentication enabled)
```

**Request Body**:
```json
{
  "tasks": [
    "go to github.com",
    "scroll down 500",
    "hover over .menu",
    "click search button",
    "wait for #results to appear"
  ],
  "headless": true
}
```

**Response**:
```json
{
  "success": true,
  "results": [...],
  "totalTasks": 3,
  "successfulTasks": 3,
  "failedTasks": 0,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get Workflow Templates

**Endpoint**: `GET /api/workflows`

**Headers**:
```
x-api-key: your_api_key (if authentication enabled)
```

**Response**:
```json
{
  "success": true,
  "templates": [
    {
      "id": "template_1",
      "name": "Login Flow",
      "description": "Standard login workflow",
      "tasks": ["go to https://example.com", "click login button", ...],
      "tags": ["authentication", "login"]
    }
  ]
}
```

### Get Screenshots

**Endpoint**: `GET /api/screenshots`

**Headers**:
```
x-api-key: your_api_key (if authentication enabled)
```

**Response**:
```json
{
  "success": true,
  "screenshots": [
    {
      "filename": "screenshot_123.png",
      "url": "/screenshots/screenshot_123.png",
      "size": 245678,
      "created": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 15
}
```

## 🎯 Supported Commands (26+ Types)

### Navigation
- `go to <url>` - Navigate to a URL
- `visit <url>` - Navigate to a URL
- `navigate to <url>` - Navigate to a URL
- `access <page>` - Navigate by clicking a link/button with text

**Examples:**
```
go to https://example.com
go to github.com
access my dashboard
```

### Search
- `search for <query>` - Google search
- `search <query>` - Google search

**Examples:**
```
search for react tutorials
search Tradia AI
```

### Clicking (Smart Text-Based)
- `click <button text>` - Click by visible text (button, link, etc.)
- `click <selector>` - Click by CSS selector

**Examples:**
```
click login button
click menu
click Sign In
click #submit-btn
```

### Scrolling ✨ NEW
- `scroll down` - Scroll down 500px
- `scroll up` - Scroll up 500px
- `scroll down <pixels>` - Scroll down custom amount
- `scroll to top` - Scroll to page top
- `scroll to bottom` - Scroll to page bottom
- `scroll to <selector>` - Scroll to element

**Examples:**
```
scroll down
scroll down 1000
scroll to top
scroll to #footer
```

### Hovering ✨ NEW
- `hover over <selector>` - Hover over element
- `hover <selector>` - Hover over element

**Examples:**
```
hover over .menu-item
hover #dropdown-trigger
```

### Dropdown Selection ✨ NEW
- `select "<option>" from <selector>` - Select dropdown option

**Examples:**
```
select "United States" from #country
select "Blue" from select[name="color"]
```

### Text Extraction ✨ NEW
- `get text from <selector>` - Extract text from element
- `extract text from <selector>` - Extract text from element

**Examples:**
```
get text from h1
extract text from .description
```

### Smart Waits ✨ NEW
- `wait for <selector> to appear` - Wait for element
- `wait for <selector> for <seconds> seconds` - Wait with timeout
- `wait <seconds>` - Wait for duration

**Examples:**
```
wait for #success to appear
wait for .loading for 10 seconds
wait 5
```

### Tab Management ✨ NEW
- `switch to tab <index>` - Switch to browser tab (0-indexed)

**Examples:**
```
switch to tab 0
switch to tab 1
```

### File Operations ✨ NEW
- `upload <filepath> to <selector>` - Upload file to input
- `download` - Capture download event

**Examples:**
```
upload /path/to/file.pdf to input[type="file"]
download
```

### Form Filling (Smart Label Detection)
- `fill <field name> with <value>` - Fill by label text
- `fill <selector> with <value>` - Fill by CSS selector

**Examples:**
```
fill email with test@example.com
fill password with mypassword
fill #username with john_doe
```

### Keyboard Actions
- `type <text> in <selector>` - Type text
- `press <key>` - Press a keyboard key

**Examples:**
```
type hello world in #search
press Enter
```

### Data Extraction
- `extract links` - Get all links from page
- `screenshot` - Capture page screenshot (auto-saved to gallery)

### Complex Multi-Step Workflows
Separate commands with commas to execute them in sequence:

**Examples:**
```
go to example.com, scroll down, hover over button, click menu

go to store.com, select "Blue" from #color, click add to cart, screenshot

go to form.com, fill name, wait for #confirmation to appear, screenshot

go to github.com, scroll to bottom, extract links
```

## 🔧 Troubleshooting

### Playwright Installation Issues

If Playwright browsers aren't installing:

```bash
npx playwright install --with-deps chromium
```

### Memory Issues on Vercel

The configuration is optimized for Vercel Hobby plan (2GB limit). For Pro plan:

1. Upgrade your Vercel plan
2. Adjust `vercel.json`:
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

### Build Errors

If you encounter ESLint or TypeScript errors:

```bash
# Run build locally to see errors
pnpm run build

# Common fixes already implemented:
# - Suspense boundaries for useSearchParams
# - TypeScript strict mode compliance
# - ESLint rule compliance
```

### API Authentication Issues

If API calls fail with 401:

1. Check `NAVA_API_KEY` is set in `.env.local`
2. Include `x-api-key` header in requests
3. Or set `NAVA_API_KEY=none` to disable auth

## 📁 Project Structure

```
Nava/
├── app/                          # Next.js app directory (Web App)
│   ├── api/
│   │   ├── execute/
│   │   │   └── route.ts          # Single task execution API
│   │   ├── execute-chain/
│   │   │   └── route.ts          # Task chain execution API
│   │   ├── workflows/            # ✨ NEW
│   │   │   └── route.ts          # Workflow templates API
│   │   └── screenshots/          # ✨ NEW
│   │       └── route.ts          # Screenshot management API
│   ├── workflows/                # ✨ NEW
│   │   └── page.tsx              # Workflow management page
│   ├── screenshots/              # ✨ NEW
│   │   └── page.tsx              # Screenshot gallery page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Enhanced home page with all features
├── lib/                          # Web app utilities
│   ├── browser.ts                # Browser session management (enhanced)
│   ├── task-executor.ts          # Task parsing and execution (enhanced)
│   ├── workflow-manager.ts       # ✨ NEW - Workflow storage & operations
│   └── screenshot-manager.ts     # ✨ NEW - Screenshot storage & operations
├── public/
│   └── screenshots/              # ✨ NEW - Screenshot storage directory
├── middleware.ts                 # ✨ NEW - API authentication middleware
├── nava-cli/                     # Python CLI Tool
│   ├── cli.py                    # Main CLI entry point
│   ├── browser.py                # Browser automation core
│   ├── task_executor.py          # Task execution logic
│   ├── scheduler.py              # Task scheduling
│   ├── workflow.py               # Workflow management
│   ├── integrations.py           # External integrations
│   ├── api_server.py             # API server for CLI
│   ├── setup.bat                 # Windows setup script
│   ├── run.bat                   # Windows run script
│   └── README_PRO.md             # CLI documentation
├── .env.example                  # Environment variables template (enhanced)
├── next.config.js                # Next.js configuration
├── package.json                  # Web app dependencies
├── pnpm-lock.yaml                # pnpm lock file
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration (strict mode)
├── vercel.json                   # Vercel deployment config (optimized)
├── netlify.toml                  # ✨ NEW - Netlify deployment config
├── QUICKSTART.md                 # Quick start guide
├── FEATURES.md                   # ✨ NEW - Detailed feature documentation
├── QUICK-REFERENCE.md            # ✨ NEW - Command cheat sheet
├── IMPLEMENTATION-COMPLETE.md    # ✨ NEW - Technical implementation details
├── NEW-FEATURES-README.md        # ✨ NEW - v2.0 feature overview
└── README.md                     # This file
```

## 🚀 Performance Optimization

### 1. Edge Runtime (Optional)

For faster cold starts, consider Edge runtime for non-browser tasks:

```typescript
export const runtime = 'edge';
```

### 2. Caching

Implement response caching for repeated tasks:

```typescript
export const revalidate = 60; // Cache for 60 seconds
```

### 3. Parallel Execution

Use the task chain API with parallel execution for multiple tasks.

## 🔒 Security Considerations

### ✅ Implemented Security Features
1. **API Key Authentication**: Optional middleware-based authentication (`middleware.ts`)
2. **CORS Configuration**: Properly configured CORS headers
3. **Input Validation**: TypeScript strict mode with comprehensive validation
4. **Environment Variables**: Secure configuration management
5. **Type Safety**: Full TypeScript coverage with strict mode

### 🔐 Production Security Checklist
1. **Set API Key**: Always set a strong `NAVA_API_KEY` in production
2. **Enable HTTPS**: Vercel provides automatic HTTPS
3. **Rate Limiting**: Consider implementing rate limiting middleware
4. **Input Sanitization**: Validate all user inputs before processing
5. **Error Handling**: Production error messages don't expose sensitive data
6. **Monitoring**: Set up logging and monitoring for suspicious activity

### 🛡️ API Security Best Practices
```env
# Production .env.local
NAVA_API_KEY=use_a_strong_random_key_here_min_32_chars
NODE_ENV=production
```

Always include the API key in requests:
```bash
curl -H "x-api-key: your_secure_key" https://your-app.vercel.app/api/execute
```

## 📈 Monitoring

### Vercel Analytics

Vercel Analytics is integrated. View metrics at:
```
https://vercel.com/your-username/nava-web/analytics
```

### Custom Logging

Add custom logging in API routes:

```typescript
console.log('Task executed:', result);
```

## 📖 Additional Documentation

### 📘 User Guides
- **[QUICKSTART.md](QUICKSTART.md)**: Fast 5-minute setup guide
- **[FEATURES.md](FEATURES.md)**: ✨ **NEW** - Complete feature guide with examples
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)**: ✨ **NEW** - Command cheat sheet
- **[NEW-FEATURES-README.md](NEW-FEATURES-README.md)**: ✨ **NEW** - v2.0 release overview

### 🔧 Technical Documentation
- **[IMPLEMENTATION-COMPLETE.md](IMPLEMENTATION-COMPLETE.md)**: ✨ **NEW** - Technical implementation details
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Detailed Vercel deployment instructions
- **[MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md)**: Project restructuring notes

### 🖥️ CLI Documentation
- **[nava-cli/README_PRO.md](nava-cli/README_PRO.md)**: Complete CLI documentation
- **[nava-cli/QUICKSTART.md](nava-cli/QUICKSTART.md)**: CLI quick start guide

### 🎯 Quick Links
- **Web Pages**: Visit `/workflows` and `/screenshots` after running the app
- **API Endpoints**: `/api/execute`, `/api/execute-chain`, `/api/workflows`, `/api/screenshots`
- **Environment Config**: See `.env.example` for all configuration options

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🆘 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/Abdulmuiz44/Nava)
- Check the troubleshooting section
- Review Vercel deployment logs (for web app)
- See CLI documentation for CLI-specific issues

## 🎉 Credits

### Web Application
- [Next.js 14](https://nextjs.org/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### CLI Tool
- [Python](https://www.python.org/)
- [Playwright](https://playwright.dev/)
- [Rich](https://github.com/Textualize/rich) (for terminal UI)

### Core
- [Playwright](https://playwright.dev/) - Browser automation engine

---

**Made with ❤️ by Abdulmuiz44**

⭐ Star this repo if you find it useful!
