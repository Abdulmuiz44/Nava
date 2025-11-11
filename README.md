# Nava 🤖

**Intelligent Browser Automation Platform** - Control browsers with natural language commands.

Nava is available in **two versions**:
- 🐍 **Python CLI** - Command-line interface for local automation
- 🌐 **Next.js Web App** - Modern web interface with beautiful UI (deployable to Vercel)

Both versions share the same powerful automation capabilities built on Playwright.

---

## 🚀 Choose Your Version

<table>
<tr>
<td width="50%" align="center">

### 🌐 **Next.js Web App**
**Recommended for Production**

```bash
cd nava-web
npm install && npm run dev
```

[📖 Web Documentation →](nava-web/README.md)

</td>
<td width="50%" align="center">

### 🐍 **Python CLI**
**For Developers & Scripts**

```bash
pip install -r requirements.txt
python main.py "go to github.com"
```

[📖 CLI Documentation ↓](#python-cli-installation-)

</td>
</tr>
</table>

---

### 🌐 Next.js Web App (Recommended for Production)

**Modern, production-ready web application with:**
- ✨ Beautiful UI with Tailwind CSS
- 🔗 RESTful API endpoints
- 🚀 One-click Vercel deployment
- 🌍 Global CDN distribution
- 📊 Built-in analytics
- 🎨 Real-time command execution
- ⚡ Task chaining with commas
- 👁️ Visible/Headless browser toggle

**Quick Start:**
```bash
cd nava-web
npm install
npm run dev
# Visit http://localhost:3000
```

**Deploy to Vercel:**
```bash
cd nava-web
vercel
```

📚 **Full Web Documentation:** See [`nava-web/README.md`](nava-web/README.md) and [`NAVA-WEB-README.md`](NAVA-WEB-README.md)

---

### 🐍 Python CLI (Classic Version)

**Command-line interface for developers:**
- 💻 Terminal-based control
- 🔧 Python library integration
- 🛠️ Scriptable automation
- 📦 Offline usage

**Quick Start:**
```bash
pip install -r requirements.txt
python -m playwright install chromium
python main.py "go to github.com"
```

Continue reading below for full Python CLI documentation.

---

## Features ✨

### Shared Features (Both Versions)
- **Natural Language Commands**: "go to github.com", "search for tutorials", "extract links"
- **Playwright Automation**: Reliable cross-browser automation
- **Screenshot Capture**: Save screenshots of browsing sessions
- **Task Chaining**: Execute multiple commands in sequence
- **Headless & Visible Modes**: Run with or without browser window

### Web Version Exclusive
- **Modern UI**: Beautiful, responsive interface
- **API Endpoints**: `/api/execute` and `/api/execute-chain`
- **Real-time Feedback**: Live execution status
- **Command History**: Track your automation tasks
- **Task Chain Detection**: Automatically handles comma-separated commands
- **Vercel Deployment**: Production-ready in seconds

### CLI Version Exclusive
- **Programmatic API**: Use as Python library
- **Multiple Browsers**: Chrome, Firefox, WebKit support
- **Batch Files**: Windows one-click automation
- **Script Integration**: Easy Python integration

## Python CLI Installation 🚀

> **Note:** For Next.js Web App installation, see [`nava-web/README.md`](nava-web/README.md)

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Python Installation (Windows)

If you see "python is not recognized" error, you need to install Python first:

1. **Download Python from [python.org](https://python.org/downloads/)**
2. **During installation, CHECK "Add Python to PATH"** ✅
3. **Restart your command prompt/PowerShell**
4. **Test installation:**
```powershell
python --version
# OR try:
py --version
```

### Quick Setup

1. **Clone or download this repository**
```powershell
git clone <repository-url>
cd Nava
```

2. **Install Python dependencies**
```powershell
# Try one of these commands:
python -m pip install -r requirements.txt
# OR if python doesn't work:
py -m pip install -r requirements.txt
```

3. **Install browser binaries**
```powershell
# Try one of these:
python -m playwright install chromium
# OR:
py -m playwright install chromium
```

### Easy Windows Setup (Alternative)

If you're on Windows and having Python issues, use the provided batch files:

1. **🚀 SUPER EASY - One-click installer:**
```powershell
INSTALL_EVERYTHING.bat
```
This will:
- Guide you through Python installation
- Install all requirements automatically
- Test everything for you
- Give you a working Nava!

2. **Then use the agent:**
```powershell
run.bat "go to https://github.com"
run.bat "search for python tutorials"
run.bat
```

The batch files will automatically detect your Python installation!

## Python CLI Usage 📖

> **Note:** For Next.js Web App usage, visit http://localhost:3000 after running `npm run dev` in the `nava-web` folder

### Command Line Interface

#### Basic Usage
```powershell
# Navigate to a website (try both commands if one doesn't work)
python main.py "go to https://github.com"
# OR:
py main.py "go to https://github.com"

# Perform a web search
python main.py "search for python tutorials"
# OR:
py main.py "search for python tutorials"

# Interactive mode (prompts for input)
python main.py
# OR:
py main.py
```

#### Advanced Options
```powershell
# Use a specific browser
python main.py "go to example.com" --browser firefox
# OR:
py main.py "go to example.com" --browser firefox

# Run in headless mode (no visible window)
python main.py "search cats" --headless

# Save a screenshot
python main.py "go to github.com" --screenshot results.png

# Set custom timeout
python main.py "go to slow-website.com" --timeout 60
```

#### Available Browsers
- `chrome` (default) - Google Chrome
- `chromium` - Chromium browser
- `firefox` - Mozilla Firefox  
- `webkit` - WebKit (Safari engine)

### Programmatic Usage

```python
import asyncio
from browser import BrowserConfig, BrowserSession
from task_executor import execute_task

async def example():
    # Configure browser
    config = BrowserConfig(
        browser_type="chromium",
        channel="chrome",
        headless=False
    )
    
    # Execute a task
    async with BrowserSession(config) as session:
        result = await execute_task("go to https://python.org", session)
        print(f"Task completed: {result.detail}")
        
        # Take a screenshot
        await session.screenshot("python_org.png", full_page=True)

# Run the example
asyncio.run(example())
```

### Using the High-Level Agent Class

```python
import asyncio
from Nava import Nava
from browser import BrowserConfig

async def main():
    # Create agent with custom config
    config = BrowserConfig(headless=True)
    agent = Nava(config)
    
    # Execute tasks
    result = await agent.execute_task("search for machine learning")
    print(f"Search completed: {result.success}")
    
    # Execute with screenshot
    result = await agent.execute_with_screenshot(
        "go to https://docs.python.org", 
        "python_docs.png"
    )

asyncio.run(main())
```

## Supported Commands 🎯

Both Python CLI and Next.js Web versions support these natural language patterns:

### Navigation Commands
- `"go to https://example.com"`
- `"go to github.com"` (automatically adds https://)
- `"go to localhost:3000"` (automatically uses http://)

### Search Commands
- `"search for python tutorials"`
- `"search machine learning"`
- `"find restaurants near me"`
- Or just type any query without "search" prefix

### Task Chaining (Web Version)
Separate multiple commands with commas to execute them in sequence:
- `"go to google.com, search Tradia"`
- `"go to github.com, extract links"`
- `"go to example.com, screenshot, extract links"`

### Additional Commands
- `"extract links"` - Get all links from the current page
- `"screenshot"` - Capture the current page
- `"click [selector]"` - Click an element
- `"fill [selector] with [text]"` - Fill a form field
- `"press [key]"` - Press a keyboard key

## Configuration ⚙️

### Browser Configuration Options

```python
from browser import BrowserConfig

config = BrowserConfig(
    browser_type="chromium",    # Browser engine
    channel="chrome",           # Specific browser channel
    headless=False,            # Run headless or with GUI
    viewport_width=1280,       # Browser window width
    viewport_height=720        # Browser window height
)
```

### Logging

The application uses Python's built-in logging. To see detailed logs:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

## Examples 💡

### Common Use Cases

```powershell
# Website monitoring
python main.py "go to https://status.github.com" --screenshot status.png
# OR:
py main.py "go to https://status.github.com" --screenshot status.png

# Research automation  
python main.py "search for latest AI research papers"

# Testing websites
python main.py "go to http://localhost:3000" --browser firefox

# Documentation browsing
python main.py "go to https://docs.python.org/3/" --headless
```

### Batch Processing

```python
import asyncio
from Nava import Nava

async def batch_browse():
    agent = Nava()
    
    tasks = [
        "go to https://github.com",
        "go to https://stackoverflow.com", 
        "search for python best practices"
    ]
    
    for i, task in enumerate(tasks):
        result = await agent.execute_with_screenshot(
            task, f"screenshot_{i}.png"
        )
        print(f"Completed: {task} - Success: {result.success}")

asyncio.run(batch_browse())
```

## Troubleshooting 🔧

### Common Issues

**Browser not found**
```powershell
# Make sure browsers are installed (try both commands)
python -m playwright install chromium
# OR:
py -m playwright install chromium
```

**Python not recognized (Windows)**
```powershell
# 1. Install Python from https://python.org/downloads/
# 2. During installation, CHECK "Add Python to PATH"
# 3. Restart PowerShell/Command Prompt
# 4. Test with: python --version OR py --version
```

**Permission errors**
```powershell
# Run PowerShell as Administrator if needed
# Right-click PowerShell -> "Run as Administrator"
```

**Import errors**
```powershell
# Ensure you're in the project directory
cd Nava
python main.py
# OR:
py main.py
```

**Timeout errors**
```powershell
# Increase timeout for slow websites
python main.py "go to slow-site.com" --timeout 120
```

### Getting Help

1. Check this README for usage examples
2. Review the error messages - they include helpful details
3. Enable verbose logging for debugging
4. Make sure all dependencies are properly installed

## Development 🛠️

### Project Structure

```
Nava/
├── 🐍 Python CLI Version
│   ├── main.py              # Main entry point
│   ├── cli.py               # Command-line interface
│   ├── browser.py           # Browser session management
│   ├── task_executor.py     # Task parsing and execution
│   ├── Nava.py              # High-level agent class
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # This file
│
├── 🌐 Next.js Web Version
│   └── nava-web/
│       ├── app/
│       │   ├── api/         # API routes
│       │   │   ├── execute/        # Single task execution
│       │   │   └── execute-chain/  # Task chain execution
│       │   ├── page.tsx     # Main UI
│       │   └── layout.tsx   # Root layout
│       ├── lib/
│       │   ├── browser.ts          # Browser automation
│       │   └── task-executor.ts    # Task parsing
│       ├── package.json     # Dependencies
│       ├── vercel.json      # Deployment config
│       └── README.md        # Web version docs
│
└── 📚 Documentation
    ├── NAVA-WEB-README.md          # Web version overview
    ├── nava-web/DEPLOYMENT.md      # Deployment guide
    └── nava-web/QUICKSTART.md      # Quick start guide
```

### Running Tests

```powershell
# Run the test CLI (try both commands)
python test_browser_use.py "go to https://example.com"
# OR:
py test_browser_use.py "go to https://example.com"
```

### Version Comparison

| Feature | Python CLI | Next.js Web |
|---------|-----------|-------------|
| **Interface** | Terminal | Web Browser |
| **Deployment** | Local only | Vercel/Cloud |
| **UI** | Text-based | Modern GUI |
| **API Access** | Python library | REST API |
| **Task Chaining** | Manual scripting | Comma-separated |
| **Real-time Feedback** | Console logs | Live UI updates |
| **Command History** | ❌ | ✅ |
| **Browser Toggle** | CLI flag | UI checkbox |
| **Analytics** | ❌ | ✅ Vercel |
| **Global Access** | ❌ | ✅ CDN |
| **Setup Time** | 5 min | 2 min |
| **Best For** | Scripts/Local | Production/Teams |

### Contributing

**Python CLI:**
1. Follow PEP 8 style guidelines
2. Add logging for new features
3. Include error handling for edge cases

**Next.js Web:**
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Maintain API compatibility

**Both:**
- Update relevant README files
- Test automation functionality
- Document new features

## License 📄

This project is open source. Please check the license file for details.

## Support 💬

For issues, questions, or contributions, please refer to the project repository or contact the maintainers.

---

## 📚 Quick Links

### Next.js Web Version
- 📖 [Full Web Documentation](nava-web/README.md)
- 🚀 [Quick Start Guide](nava-web/QUICKSTART.md)
- 🌐 [Deployment Guide](nava-web/DEPLOYMENT.md)
- 🔄 [Migration Summary](nava-web/MIGRATION-SUMMARY.md)
- 📝 [Web Overview](NAVA-WEB-README.md)

### Python CLI Version
- 📖 You're reading it! (This README)
- 🐍 [Python Requirements](requirements.txt)

### Getting Started
- **Want a web interface?** → Go to [`nava-web`](nava-web/) folder
- **Want command-line?** → Continue with Python CLI (above)
- **Want both?** → They work together perfectly!

---

**Happy Automating! 🚀🌐**
