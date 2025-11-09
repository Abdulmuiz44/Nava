# Quick Start Guide - Browsing Agent Pro

## Installation

```powershell
# Install dependencies
pip install -r requirements.txt

# Install browser
py -m playwright install chromium
```

## 5-Minute Tour

### 1. Basic Navigation
```powershell
py main.py "go to github.com"
```

### 2. Search
```powershell
py main.py "search for python tutorials"
```

### 3. Multiple Tasks (Chaining)
```powershell
py main.py "go to github.com, search python, take screenshot"
```

### 4. Extract Data
```powershell
py main.py "extract all links from https://github.com" --json links.json
```

### 5. Click & Fill Forms
```powershell
py main.py "
  go to github.com,
  click on 'Sign in',
  fill input[name=login] with myemail@example.com,
  fill input[name=password] with mysecret,
  press Enter
"
```

### 6. Interactive Mode
```powershell
py main.py -i
```

Type commands like:
- `go to github.com`
- `search python tutorials`
- `click 'Sign In'`
- `help` for more

### 7. Save & Reuse Workflows
```powershell
# Save a workflow
py main.py "go to github.com, click login" --save my_login.yaml

# Reuse it later
py main.py --load my_login.yaml
```

### 8. API Server
```powershell
# Start server
py main.py --api --port 8000

# In another terminal, call it:
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "go to github.com", "browser": "chrome"}'
```

---

## Common Use Cases

### Web Scraping
```powershell
py main.py "
  go to https://example.com,
  extract all text from current,
  extract all links from current
" --json output.json
```

### Form Automation
```powershell
py main.py "
  go to mysite.com/form,
  fill #name with John Doe,
  fill #email with john@example.com,
  fill #message with Hello,
  click button[type=submit]
"
```

### Login Automation
```powershell
py main.py "
  go to site.com/login,
  fill input[name=username] with user,
  fill input[name=password] with pass,
  press Enter
"
```

### Data Monitoring
```powershell
# Check status every 5 minutes
py main.py "go to status.site.com, take screenshot" \
  --schedule "every 5 minutes" \
  --slack https://hooks.slack.com/services/YOUR/WEBHOOK
```

### Parallel Tasks
```powershell
py main.py \
  "extract links from site1.com" \
  "extract links from site2.com" \
  "extract links from site3.com" \
  --parallel 3 \
  --json results.json
```

---

## Selector Guide

Use CSS selectors to target elements:

```
button              All buttons
.btn-primary        Elements with class "btn-primary"
#submit             Element with id "submit"
input[name=email]   Input with name="email"
a[href*="github"]   Links containing "github"
```

---

## Options Cheat Sheet

```
--browser chrome|firefox|webkit    Choose browser (default: chrome)
--headless                         No visible window
--timeout 60                       Wait up to 60 seconds
--retries 3                        Retry failed tasks 3 times
--json output.json                 Save results as JSON
--screenshot result.png            Save screenshot
--load workflow.yaml               Load workflow file
--save workflow.yaml               Save workflow file
--vars key=val,key2=val2          Use variables
--webhook http://...              Send results to webhook
--slack http://...                Slack notifications
-i, --interactive                  Interactive mode
```

---

## Troubleshooting

**Python not found?**
```powershell
# Try:
py --version

# Or install from https://python.org
```

**Browser error?**
```powershell
py -m playwright install chromium
```

**Timeout errors?**
```powershell
py main.py "slow-task" --timeout 120
```

**Element not found?**
- Add wait before clicking:
```powershell
py main.py "wait for '.button', click '.button'"
```

---

## Next Steps

1. Read **FEATURES.md** for all capabilities
2. Check **examples/** directory for sample workflows
3. Try **--interactive** mode with help command
4. Start building your automation!

---

Questions? Run: `py main.py -h`
