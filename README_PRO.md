# 🌐 Browsing Agent Pro - Advanced Browser Automation

**Transform web interactions into automations with natural language commands.**

## ✨ What's New in Pro

All 13 features implemented:
- ✅ Element Interaction (click, fill, type, press)
- ✅ Task Chaining (execute multiple tasks)
- ✅ Data Extraction (JSON output)
- ✅ Workflow Files (YAML/JSON)
- ✅ Conditional Logic (if/else)
- ✅ Variable Substitution
- ✅ Retry Logic (with exponential backoff)
- ✅ Video Recording
- ✅ REST API Server
- ✅ Cloud Integration (Webhooks, Slack, DB, S3)
- ✅ Scheduled Jobs
- ✅ Parallel Execution
- ✅ Advanced Error Handling

---

## 🚀 Quick Start

### Installation
```powershell
# Install Python 3.8+
# Then:
pip install -r requirements.txt
py -m playwright install chromium
```

### First Command
```powershell
py main.py "go to github.com"
```

### Interactive Mode
```powershell
py main.py -i
```

---

## 💡 Use Cases

### 🏢 Enterprise Automation
```powershell
# Load complex workflow with retries
py main.py --load workflows/daily_report.yaml --retries 3 --webhook http://slack.webhook
```

### 📊 Data Pipeline
```powershell
py main.py "
  go to site.com,
  wait for '.data',
  extract all text from current,
  take screenshot
" --json results.json --s3 my-bucket
```

### 🔐 Security Auditing
```powershell
py main.py "
  go to site.com,
  if '.warning' exists then screenshot 'security_issue.png'
" --continue-on-error --slack webhook-url
```

### 📱 Cross-Browser Testing
```powershell
py main.py --load test.yaml --browser chrome --headless
py main.py --load test.yaml --browser firefox --headless
py main.py --load test.yaml --browser webkit --headless
```

### ⏰ Scheduled Monitoring
```powershell
py main.py "check site status" \
  --schedule "every 5 minutes" \
  --slack webhook-url \
  --continue-on-error
```

### 🌐 REST API Integration
```powershell
# Start API server
py main.py --api --port 8000

# Use from any language:
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "go to github.com", "browser": "chrome"}'
```

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute getting started
- **[FEATURES.md](FEATURES.md)** - Complete feature guide
- **[examples/](examples/)** - Sample workflows

---

## 🎯 Core Commands

### Navigation
```powershell
go to https://github.com
search for python tutorials
```

### Interaction
```powershell
click on 'Sign In'
fill input[name=email] with user@example.com
type 'hello world' in #searchbox
press Enter
wait for '.loading' to disappear
```

### Data Extraction
```powershell
extract all links from https://example.com
extract headings from current
extract images from current
extract tables from current
```

### Control
```powershell
if '.premium' exists then click 'Upgrade'
take screenshot
execute "document.title"
```

---

## 🔧 Advanced Features

### Task Chaining
```powershell
py main.py "
  go to github.com,
  click login,
  fill #email with user@example.com,
  fill #password with secret,
  press Enter,
  wait for '.dashboard',
  take screenshot
"
```

### Workflows (YAML)
```yaml
name: "GitHub Login"
browser: chrome
tasks:
  - "go to https://github.com"
  - "click on 'Sign In'"
  - "fill input[name=login] with {email}"
  - "fill input[name=password] with {password}"
  - "press Enter"
variables:
  email: "user@example.com"
  password: "secret"
```

```powershell
py main.py --load workflow.yaml --vars email=test@example.com password=newsecret
```

### Retries & Error Handling
```powershell
py main.py "flaky-task" --retries 3 --continue-on-error
```

### Cloud Integration
```powershell
py main.py "extract data" \
  --json results.json \
  --webhook https://myserver.com \
  --slack https://hooks.slack.com/... \
  --s3 my-bucket \
  --db postgresql://...
```

### Scheduled Execution
```powershell
py main.py --load workflow.yaml \
  --schedule "daily at 10:00" \
  --slack webhook-url
```

### REST API
```powershell
# Start server
py main.py --api --port 8000

# Execute remotely
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "go to github.com",
    "browser": "chrome",
    "headless": true,
    "timeout": 30
  }'
```

---

## 📊 Output Formats

### JSON Results
```powershell
py main.py "extract links from site.com" --json output.json
```

```json
{
  "success": true,
  "task_count": 1,
  "results": [
    {
      "task_type": "extract",
      "detail": "Extracted 15 items",
      "success": true,
      "data": {
        "count": 15,
        "results": [...]
      }
    }
  ]
}
```

### Screenshots & Videos
```powershell
py main.py "my-task" --screenshot result.png
py main.py "my-task" --video recording.mp4
```

---

## 🔌 Integration Examples

### Slack Notifications
```powershell
py main.py "go to site.com" --slack https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Database Storage
```powershell
py main.py "extract data" --db postgresql://user:pass@localhost/db
```

### AWS S3 Upload
```powershell
py main.py "extract data" --json output.json --s3 my-bucket
```

### Custom Webhooks
```powershell
py main.py "extract data" --webhook https://myserver.com/api/results
```

---

## 📈 Performance

### Parallel Execution
```powershell
py main.py task1.yaml task2.yaml task3.yaml --parallel 3
```

### Headless Mode (Fast)
```powershell
py main.py "my-task" --headless
```

### Browser Selection
```powershell
py main.py "my-task" --browser webkit  # Fastest
py main.py "my-task" --browser chrome  # Default
```

---

## 🛠️ CLI Options Reference

```
POSITIONAL:
  prompt                    Task or workflow name

CORE OPTIONS:
  --browser {chrome,firefox,webkit}
  --headless                Run without UI
  --timeout SECONDS         Task timeout (default: 30)
  -i, --interactive         Interactive mode

WORKFLOW:
  --load FILE              Load workflow YAML/JSON
  --save FILE              Save workflow
  --vars KEY=VAL,...       Set variables

OUTPUT:
  --json FILE              JSON results
  --screenshot FILE        Save screenshot
  --video FILE             Record video

EXECUTION:
  --retries COUNT          Retry attempts
  --continue-on-error      Skip failures
  --parallel COUNT         Parallel tasks

INTEGRATION:
  --webhook URL            Webhook endpoint
  --slack URL              Slack webhook
  --db CONNECTION          Database
  --s3 BUCKET              S3 bucket

SCHEDULING:
  --schedule INTERVAL      Schedule (e.g., "every 5 minutes")

API:
  --api                    Start API server
  --port PORT              API port (default: 8000)
  --host HOST              API host (default: 0.0.0.0)

DEBUGGING:
  --verbose                Verbose logging
  --debug-log FILE         Debug log file
```

---

## 🎓 Examples

See **[examples/](examples/)** directory:
- `github_login.yaml` - Form automation
- `data_extraction.yaml` - Web scraping
- `scheduled_task.yaml` - Periodic monitoring

---

## 🐛 Troubleshooting

**Python/PyEnv Issues**
```powershell
py --version              # Check Python
py -m pip install -r requirements.txt  # Reinstall deps
py -m playwright install  # Reinstall browsers
```

**Browser Not Found**
```powershell
py -m playwright install chromium
```

**Timeout Errors**
```powershell
py main.py "slow-task" --timeout 120
```

**Element Not Found**
```powershell
# Add wait before action:
py main.py "wait for '.button', click '.button'"
```

**API Won't Start**
```powershell
pip install fastapi uvicorn  # Install dependencies
py main.py --api --port 8000
```

---

## 📦 Requirements

```
playwright>=1.40.0
pyyaml>=6.0
fastapi>=0.104.0
uvicorn>=0.24.0
aiohttp>=3.9.0
requests>=2.31.0
schedule>=1.2.0
python-dotenv>=1.0.0
```

Install with:
```powershell
pip install -r requirements.txt
```

---

## 🚀 Production Deployment

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN playwright install chromium
COPY . .
CMD ["py", "main.py", "--api", "--host", "0.0.0.0"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: browsing-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: browsing-agent
  template:
    metadata:
      labels:
        app: browsing-agent
    spec:
      containers:
      - name: agent
        image: browsing-agent:latest
        ports:
        - containerPort: 8000
        env:
        - name: SLACK_WEBHOOK
          valueFrom:
            secretKeyRef:
              name: integrations
              key: slack-webhook
```

### Cloud Services
- **AWS Lambda** - Trigger via API Gateway
- **Google Cloud Functions** - Scheduled or event-driven
- **Azure Functions** - Serverless automation
- **Heroku** - Simple deployment

---

## 📈 Roadmap

Future enhancements:
- [ ] Machine learning for element detection
- [ ] Advanced visual recognition
- [ ] Multi-tab support
- [ ] JavaScript debugging
- [ ] Performance profiling
- [ ] Advanced scheduling (cron expressions)
- [ ] Distributed execution
- [ ] Mobile browser support

---

## 🤝 Contributing

Contributions welcome! Areas:
- New action types
- Integration plugins
- Performance improvements
- Documentation

---

## 📄 License

Open source - See LICENSE file

---

## 💬 Support

- **Documentation**: See FEATURES.md and QUICKSTART.md
- **Examples**: Check examples/ directory
- **Issues**: GitHub issues
- **Help**: Run `py main.py -h`

---

**Ready to automate? Start with:**
```powershell
py main.py -i
```

**Or load an example:**
```powershell
py main.py --load examples/github_login.yaml
```

**Happy automating! 🎉**
