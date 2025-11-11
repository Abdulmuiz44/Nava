# Nava Web - Browser Automation Platform

A production-ready Next.js application for intelligent browser automation with natural language commands. Built with TypeScript, React, Tailwind CSS, and Playwright.

## 🚀 Features

- **Natural Language Commands**: Control browsers with simple English commands
- **Smart Text-Based Clicking**: Click buttons and links by their visible text - no selectors needed!
- **Intelligent Form Filling**: Fill forms by field labels automatically
- **Multi-Step Workflows**: Chain multiple commands with commas for complex automation
- **Real-time Execution**: Instant task execution with live feedback
- **Visible/Headless Toggle**: Watch automation or run in background
- **Beautiful UI**: Modern, responsive interface with Tailwind CSS
- **TypeScript**: Fully typed codebase for better development experience
- **Playwright Integration**: Robust browser automation powered by Playwright
- **API Routes**: RESTful API endpoints for programmatic access
- **Vercel Ready**: Optimized for Vercel serverless deployment

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager
- Vercel account (for deployment)

## 🛠️ Local Development

### 1. Install Dependencies

```bash
cd nava-web
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

For production deployment:
```bash
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install && npx playwright install chromium`
6. Click "Deploy"

### Method 3: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. Add build settings:
   ```
   Build Command: npm run build
   Install Command: npm install && npx playwright install chromium
   ```
5. Deploy

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

## 📚 API Documentation

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
nava-web/
├── app/
│   ├── api/
│   │   ├── execute/
│   │   │   └── route.ts          # Single task execution API
│   │   └── execute-chain/
│   │       └── route.ts          # Task chain execution API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── browser.ts                # Browser session management
│   └── task-executor.ts          # Task parsing and execution
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vercel.json                   # Vercel deployment configuration
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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review Vercel deployment logs

## 🎉 Credits

Built with:
- [Next.js 14](https://nextjs.org/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ by the Nava Team
