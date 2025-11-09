# Browsing Agent Pro - Feature Guide

## 🎯 Core Features

### 1. **Element Interaction**
Interact with web pages programmatically.

```powershell
# Click elements
py main.py "click on 'Sign In'"

# Fill forms
py main.py "fill input[name=email] with user@example.com"

# Type text
py main.py "type 'hello world' in input[name=search]"

# Press keys
py main.py "press Enter"

# Wait for elements
py main.py "wait for '.loading-spinner' to disappear"
```

### 2. **Task Chaining**
Execute multiple tasks in sequence with commas.

```powershell
py main.py "go to github.com, click login, fill email, fill password, press Enter"

# With options
py main.py "task1, task2, task3" --retries 3 --continue-on-error
```

### 3. **Data Extraction**
Extract structured data from web pages.

```powershell
# Extract all links
py main.py "extract all links from https://github.com" --json links.json

# Extract headings
py main.py "extract headings from https://example.com" --json headings.json

# Extract images
py main.py "extract images from https://example.com" --json images.json

# Extract tables
py main.py "extract tables from https://example.com" --json tables.json

# Custom queries
py main.py "extract all text from current"
```

### 4. **Workflow Files (YAML/JSON)**
Save and reuse automation workflows.

```powershell
# Load workflow
py main.py --load workflow.yaml

# Save workflow
py main.py "go to github.com, search python" --save my_workflow.yaml

# With variables
py main.py --load workflow.yaml --vars email=user@test.com password=secret123
```

**YAML Format:**
```yaml
name: "My Workflow"
browser: chrome
headless: false
timeout: 30
retries: 2

variables:
  email: "user@example.com"
  password: "secret"

tasks:
  - "go to https://github.com"
  - "click on 'Sign In'"
  - "fill input[name=login] with {email}"
  - "fill input[name=password] with {password}"
  - "press Enter"
  - "take screenshot"

screenshot: "result.png"
```

### 5. **Conditional Logic**
Execute different actions based on page state.

```powershell
# If element exists, do this, else do that
py main.py "go to site.com, if '.premium-badge' exists then click 'Upgrade', else click 'Free Trial'"

# Complex conditions
py main.py "if '.error' exists then screenshot 'error.png' else continue"
```

### 6. **Variable Substitution**
Use variables across tasks.

```powershell
# From command line
py main.py "fill email with {email}, fill password with {password}" \
  --vars email=user@example.com password=secret123

# From workflow file (see example above)
py main.py --load workflow.yaml --vars email=test@example.com
```

### 7. **Retry Logic**
Automatic retries with exponential backoff.

```powershell
# Retry up to 3 times
py main.py "go to slow-site.com" --retries 3

# Continue on error
py main.py "task1, task2, task3" --continue-on-error
```

### 8. **Video Recording**
Record entire automation session.

```powershell
py main.py "go to github.com, search python" --video recording.mp4
```

### 9. **API Server**
Run as remote REST API.

```powershell
# Start server
py main.py --api --port 8000 --host 0.0.0.0

# Call from anywhere
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "go to github.com", "browser": "chrome"}'

# Execute task chain
curl -X POST http://localhost:8000/execute-chain \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": ["go to github.com", "search python"],
    "browser": "firefox"
  }'

# Check health
curl http://localhost:8000/health
```

### 10. **Cloud Integration**

#### Webhooks
```powershell
py main.py "extract links from site.com" --webhook https://myserver.com/webhook
```

#### Slack Notifications
```powershell
py main.py "go to site.com" --slack https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Database Storage
```powershell
py main.py "extract data from site.com" --db postgresql://user:pass@localhost/db
```

#### AWS S3 Upload
```powershell
py main.py "extract links from site.com" --json results.json --s3 my-bucket
```

### 11. **Scheduled Jobs**
Run tasks on schedules.

```powershell
# Every 5 minutes
py main.py "check site status" --schedule "every 5 minutes" --slack webhook-url

# Daily at 10am
py main.py --load workflow.yaml --schedule "daily at 10:00" --webhook webhook-url

# Every Monday at 9am
py main.py "backup data" --schedule "every monday at 09:00"
```

### 12. **Parallel Execution**
Run multiple tasks in parallel.

```powershell
py main.py \
  "extract links from site1.com" \
  "extract links from site2.com" \
  "extract links from site3.com" \
  --parallel 3
```

---

## 📋 Command Reference

### Basic Commands
```
go to <url>                  Navigate to URL
search <query>               Google search
extract <type> from <url>    Extract data
click <selector>             Click element
fill <selector> with <value> Fill form input
type <text> in <selector>    Type text
press <key>                  Press keyboard key
wait <selector>              Wait for element
take screenshot [path]       Capture screenshot
execute <javascript>         Run JavaScript
```

### Options
```
--browser {chrome,firefox,webkit}  Browser engine
--headless                         Run without UI
--timeout <seconds>                Task timeout
--retries <count>                  Retry attempts
--continue-on-error                Skip errors
--parallel <count>                 Parallel tasks

--load <file>                      Load workflow
--save <file>                      Save workflow
--vars key=val,key=val             Set variables

--json <file>                      JSON output
--screenshot <file>                Save screenshot
--video <file>                     Record video

--webhook <url>                    Send to webhook
--slack <url>                      Slack notifications
--db <connection>                  Database
--s3 <bucket>                      AWS S3

--schedule <interval>              Schedule task
--api                              Start API server
--port <number>                    API port
-i, --interactive                  Interactive mode
```

---

## 🎓 Examples

### Example 1: Login and Extract Data
```powershell
py main.py --load examples/github_login.yaml --vars email=you@example.com password=secret
```

### Example 2: Monitor Website Daily
```powershell
py main.py --load examples/scheduled_task.yaml --schedule "daily at 09:00" --slack webhook-url
```

### Example 3: Data Pipeline
```powershell
py main.py \
  "extract all links from https://github.com/trending" \
  --json trending_repos.json \
  --webhook https://myserver.com/repos \
  --s3 automation-results
```

### Example 4: Complex Workflow
```powershell
py main.py "
  go to https://example.com,
  wait for '.content',
  if '.premium' exists then click 'Upgrade',
  extract heading from current,
  take screenshot
" --retries 2 --continue-on-error --json output.json
```

### Example 5: API-Driven Automation
```powershell
# Start server
py main.py --api --port 8000

# In another terminal
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "go to github.com, extract all links",
    "browser": "chrome",
    "headless": true
  }'
```

---

## 🔧 Advanced Usage

### Custom JavaScript Execution
```powershell
py main.py 'execute "document.querySelectorAll(\"a\").length"'
```

### Form Filling with Variables
```yaml
tasks:
  - "go to login.com"
  - "fill #email with {email}"
  - "fill #password with {password}"
  - "click button[type=submit]"
  - "wait for '.dashboard'"
  - "take screenshot"
```

Then run:
```powershell
py main.py --load login.yaml --vars email=test@example.com password=secret123
```

---

## 📊 Output Formats

### JSON Output
```json
{
  "success": true,
  "task_count": 3,
  "results": [
    {
      "task_type": "navigate",
      "detail": "https://github.com",
      "success": true,
      "error": "",
      "data": null
    },
    {
      "task_type": "extract",
      "detail": "Extracted 15 items: all links",
      "success": true,
      "error": "",
      "data": {
        "query": "all links",
        "count": 15,
        "results": [...]
      }
    }
  ]
}
```

---

## 🚀 Getting Started

1. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

2. **Test basic command**
   ```powershell
   py main.py "go to github.com"
   ```

3. **Try interactive mode**
   ```powershell
   py main.py -i
   ```

4. **Load example workflow**
   ```powershell
   py main.py --load examples/github_login.yaml
   ```

5. **Start API server**
   ```powershell
   py main.py --api
   ```

---

## 💡 Tips & Tricks

- **CSS Selectors**: Use standard CSS selectors for elements
  - `button` - All buttons
  - `.class-name` - By class
  - `#id-name` - By ID
  - `input[type=email]` - By attribute
  - `a:has-text('Click me')` - By text content

- **Debugging**: Use `--verbose` for detailed logs
  ```powershell
  py main.py "go to site.com" --verbose --debug-log debug.log
  ```

- **Testing**: Use `--headless` for CI/CD pipelines
  ```powershell
  py main.py workflow.yaml --headless
  ```

- **Performance**: Use `--parallel` for multiple independent tasks
  ```powershell
  py main.py task1.yaml task2.yaml task3.yaml --parallel 3
  ```

---

## 🐛 Troubleshooting

**"Browser not found"**
```powershell
py -m playwright install chromium
```

**"Import error"**
```powershell
pip install -r requirements.txt
```

**"Timeout error"**
```powershell
py main.py "slow-task" --timeout 120
```

**"Element not found"**
- Use browser dev tools to find correct selector
- Add `wait` before interacting:
  ```powershell
  py main.py "wait for '.element', click '.element'"
  ```

---

For more help, see examples/ directory or run: `py main.py -h`
