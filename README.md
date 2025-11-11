# Nava 🤖

A Python-based browser automation agent that can perform web browsing tasks using natural language commands. Built with Playwright for reliable cross-browser automation.

## Features ✨

- **Natural Language Interface**: Command the browser using simple phrases like "go to github.com" or "search for python tutorials"
- **Cross-Browser Support**: Works with Chrome, Firefox, and WebKit
- **Headless & GUI Modes**: Run with or without a visible browser window
- **Screenshot Capture**: Automatically save screenshots of your browsing sessions
- **Command Line Interface**: Easy-to-use CLI for quick automation tasks
- **Programmatic API**: Use as a Python library in your own projects

## Installation 🚀

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

## Usage 📖

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

The agent understands these natural language patterns:

### Navigation Commands
- `"go to https://example.com"`
- `"go to github.com"` (automatically adds https://)
- `"go to localhost:3000"` (automatically uses http://)

### Search Commands
- `"search for python tutorials"`
- `"search machine learning"`
- `"find restaurants near me"`
- Or just type any query without "search" prefix

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
├── main.py              # Main entry point
├── cli.py               # Command-line interface
├── browser.py           # Browser session management
├── browser_use.py       # Legacy compatibility wrapper
├── task_executor.py     # Task parsing and execution
├── Nava.py              # High-level agent class
├── test_browser_use.py  # Alternative CLI implementation
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

### Running Tests

```powershell
# Run the test CLI (try both commands)
python test_browser_use.py "go to https://example.com"
# OR:
py test_browser_use.py "go to https://example.com"
```

### Contributing

1. Follow PEP 8 style guidelines
2. Add logging for new features
3. Include error handling for edge cases
4. Update this README for new functionality

## License 📄

This project is open source. Please check the license file for details.

## Support 💬

For issues, questions, or contributions, please refer to the project repository or contact the maintainers.

---

**Happy browsing! 🌐**
