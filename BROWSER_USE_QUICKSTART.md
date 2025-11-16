# Browser Use Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd nava-cli
pip install -r requirements.txt
```

### Step 2: Choose Your LLM

#### Option A: Anthropic Claude (Recommended)
```bash
export USE_BROWSER_USE=true
export ANTHROPIC_API_KEY=your_anthropic_key
```

#### Option B: OpenAI GPT-4
```bash
export USE_BROWSER_USE=true
export OPENAI_API_KEY=your_openai_key
```

#### Option C: Ollama (Free, Local)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3

# Set environment
export USE_BROWSER_USE=true
```

### Step 3: Run Your First Task
```bash
python nava-cli/test_browser_use.py --task "go to github.com"
```

## 📱 Mobile Emulation

```bash
# Enable mobile emulation
export ENABLE_MOBILE_EMULATION=true
export MOBILE_DEVICE="iPhone 13 Pro"

# Run with mobile
python nava-cli/test_browser_use.py --task "scroll down" --mobile
```

## 🔧 API Usage

### Start Python API Server
```bash
cd nava-cli
python api_server.py
```

### Send Request
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

## ✅ Verify Installation

Run the comprehensive test suite:
```bash
python nava-cli/test_browser_use.py --all
```

Expected output:
```
✅ Desktop Tests: 3/3 PASSED
✅ Mobile Tests: 2/2 PASSED
🎉 ALL INTEGRATION TESTS PASSED!
```

## 📚 Common Tasks

### Navigation
```bash
python nava-cli/test_browser_use.py --task "go to github.com"
```

### Search
```bash
python nava-cli/test_browser_use.py --task "search for browser automation"
```

### Form Filling
```bash
python nava-cli/test_browser_use.py --task "fill email with test@example.com"
```

### Screenshots
```bash
python nava-cli/test_browser_use.py --task "screenshot my_page.png"
```

### Extract Data
```bash
python nava-cli/test_browser_use.py --task "extract links from current page"
```

## 🐛 Troubleshooting

### Browser Use Not Enabled
```bash
# Check environment variable
echo $USE_BROWSER_USE
# Should output: true

# If not set:
export USE_BROWSER_USE=true
```

### No LLM Found
```bash
# Check if any LLM is configured
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Or use Ollama (free)
ollama list
```

### Import Errors
```bash
# Reinstall packages
pip install --upgrade browser-use langchain-anthropic langchain-openai langchain-ollama
```

## 🎯 Tips

1. **Start Simple**: Test with basic commands first
2. **Use Ollama**: For free local testing without API costs
3. **Monitor Costs**: Browser Use uses LLM API calls (Claude/GPT-4 have costs)
4. **Fallback Works**: If Browser Use fails, Playwright takes over automatically
5. **Mobile Testing**: Use headless mode for faster mobile testing

## 📖 More Information

- Full Documentation: `BROWSER_USE_INTEGRATION.md`
- Main README: `README.md`
- Test Suite: `nava-cli/test_browser_use.py`

## 💡 Examples

### Complex Multi-Step Task
```bash
python nava-cli/test_browser_use.py \
  --task "go to github.com, search for 'playwright', and extract the first 5 repository names"
```

### Mobile Form Testing
```bash
export ENABLE_MOBILE_EMULATION=true
python nava-cli/test_browser_use.py \
  --task "go to example.com and fill the contact form" \
  --mobile
```

### Headless Mode (Faster)
```bash
python nava-cli/test_browser_use.py \
  --task "take screenshot of google.com" \
  --headless
```

## 🎉 You're Ready!

Browser Use integration is now set up and ready to use. Try running complex automation tasks with natural language commands!
