# Nava - Intelligent Browser Automation Platform

A complete browser automation platform with both web and CLI interfaces. Built with Next.js, TypeScript, React, Tailwind CSS, Playwright, and Python.

## 📂 Project Structure

This repository contains two main components:

- **Web Application** (Root): Production-ready Next.js web interface at the repository root
- **CLI Tool** (`nava-cli/`): Python-based command-line interface for browser automation

Choose the interface that best fits your workflow!

## 🚀 Features

### Web Interface Features
- **Beautiful Modern UI**: Responsive interface with Tailwind CSS
- **Real-time Execution**: Instant task execution with live feedback
- **API Routes**: RESTful API endpoints for programmatic access
- **Vercel Ready**: Optimized for serverless deployment
- **TypeScript**: Fully typed codebase for better development experience

### CLI Features  
- **Python-Based**: Powerful command-line automation tool
- **Rich Terminal UI**: Interactive command-line interface
- **Scheduling**: Automate tasks with built-in scheduler
- **Workflow Management**: Create and execute complex automation workflows
- **Integration Support**: Extensible integration system

### Core Automation Features (Both Interfaces)
- **Natural Language Commands**: Control browsers with simple English commands
- **Smart Text-Based Clicking**: Click buttons and links by their visible text - no selectors needed
- **Intelligent Form Filling**: Fill forms by field labels automatically
- **Multi-Step Workflows**: Chain multiple commands for complex automation
- **Visible/Headless Toggle**: Watch automation or run in background
- **Playwright Integration**: Robust browser automation powered by Playwright

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

Create a `.env.local` file:

```env
NODE_ENV=production
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
```

### Vercel Configuration

The `vercel.json` file is pre-configured with:
- Increased memory (3GB) for browser automation
- Extended timeout (300s) for long-running tasks
- Playwright browser installation

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

### Execute Single Task

**Endpoint**: `POST /api/execute`

**Request Body**:
```json
{
  "task": "go to github.com",
  "headless": true
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "success": true,
    "taskType": "navigation",
    "detail": "Navigated to https://github.com"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Execute Task Chain

**Endpoint**: `POST /api/execute-chain`

**Request Body**:
```json
{
  "tasks": [
    "go to github.com",
    "click button#search",
    "type react in input"
  ],
  "headless": true,
  "continueOnError": false
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

## 🎯 Supported Commands

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
- `screenshot` - Capture page screenshot

### Complex Multi-Step Workflows
Separate commands with commas to execute them in sequence:

**Examples:**
```
go to example.com, click menu, click login button

go to tradiaai.app, click menu, click login button, fill email with user@example.com, fill password with pass123, access my dashboard

go to github.com, search repositories, extract links
```

### Wait Commands
- `wait <seconds>` - Wait for specified duration

**Examples:**
```
wait 5
wait for 3 seconds
```

## 🔧 Troubleshooting

### Playwright Installation Issues

If Playwright browsers aren't installing:

```bash
npx playwright install --with-deps chromium
```

### Memory Issues on Vercel

The configuration allocates 3GB memory. If you need more:

1. Upgrade your Vercel plan
2. Adjust `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008
    }
  }
}
```

### Timeout Issues

For longer tasks, increase timeout in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  }
}
```

## 📁 Project Structure

```
Nava/
├── app/                          # Next.js app directory (Web App)
│   ├── api/
│   │   ├── execute/
│   │   │   └── route.ts          # Single task execution API
│   │   └── execute-chain/
│   │       └── route.ts          # Task chain execution API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/                          # Web app utilities
│   ├── browser.ts                # Browser session management
│   └── task-executor.ts          # Task parsing and execution
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
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── package.json                  # Web app dependencies
├── pnpm-lock.yaml                # pnpm lock file
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel deployment configuration
├── QUICKSTART.md                 # Quick start guide
├── DEPLOYMENT.md                 # Detailed deployment guide
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

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Authentication**: Add API authentication for production
3. **Input Validation**: Validate all user inputs
4. **CORS**: Configure CORS for your domain

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

- **[QUICKSTART.md](QUICKSTART.md)**: Fast 5-minute setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Detailed Vercel deployment instructions
- **[nava-cli/README_PRO.md](nava-cli/README_PRO.md)**: Complete CLI documentation
- **[nava-cli/QUICKSTART.md](nava-cli/QUICKSTART.md)**: CLI quick start guide
- **[MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md)**: Project restructuring notes

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
