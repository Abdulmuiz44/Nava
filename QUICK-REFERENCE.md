# 🚀 Nava Quick Reference Guide

## 🎯 New Commands at a Glance

### Scroll
```
scroll down           scroll up
scroll to top         scroll to bottom
scroll down 500       scroll to #element
```

### Hover
```
hover over #button
hover .menu-item
```

### Select Dropdown
```
select "Blue" from #color
select "USA" from select[name="country"]
```

### Get Text
```
get text from h1
extract text from .description
```

### Wait
```
wait for #success to appear
wait for .loading for 10 seconds
```

### Tabs
```
switch to tab 0
switch to tab 1
```

### Files
```
upload /path/file.pdf to input[type="file"]
download
```

---

## 🔗 Quick Links

- **Main App**: `http://localhost:3000/`
- **Workflows**: `http://localhost:3000/workflows`
- **Screenshots**: `http://localhost:3000/screenshots`

---

## ⌨️ Keyboard Shortcuts

- `Enter` - Execute command
- `Esc` - Close dialogs

---

## 💡 Pro Tips

1. **Chain Commands**: Use commas to combine steps
   ```
   go to example.com, scroll down, click button, screenshot
   ```

2. **Save Time**: Save frequently used command chains as workflows

3. **Debug Mode**: Use visible browser first, then switch to headless

4. **Smart Waits**: Use `wait for element` instead of `wait 5`

5. **Organize**: Tag your workflows for easy searching

---

## 📊 Feature Matrix

| Feature | Status | Location |
|---------|--------|----------|
| API Authentication | ✅ | `middleware.ts` |
| New Commands (8 types) | ✅ | Main page |
| History Replay | ✅ | Main page |
| Workflow Save/Load | ✅ | `/workflows` |
| Screenshot Gallery | ✅ | `/screenshots` |
| Templates | ✅ | `/workflows` |
| Import/Export | ✅ | `/workflows` |

---

## 🔐 Security Setup

```bash
# Create .env.local
NAVA_API_KEY=your_secure_key

# Or disable
NAVA_API_KEY=none
```

---

## 🎬 Quick Start Examples

### Login Flow
```
go to app.com
click login
fill email with user@test.com
fill password with pass123
click submit
wait for #dashboard to appear
```

### E-commerce
```
go to store.com
search for laptop
click first product
scroll down
select "Blue" from #color
click add to cart
screenshot
```

### Form Filling
```
go to form.com
fill name with John Doe
fill email with john@test.com
select "USA" from #country
fill message with Hello World
click submit
wait for #success to appear
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Command not recognized | Check spelling, see FEATURES.md |
| Element not found | Use visible mode to debug |
| Screenshot not saving | Check storage quota |
| Workflow not loading | Clear localStorage |
| API auth error | Check .env.local |

---

## 📦 What's Where

```
/                 # Main automation interface
/workflows        # Workflow management
/screenshots      # Screenshot gallery
/api/execute      # Single task execution
/api/execute-chain # Multi-task execution
/api/workflows    # Workflow templates
/api/screenshots  # Screenshot operations
```

---

## 🎨 UI Navigation

```
┌─────────────────────────────────────┐
│  NAVA | Workflows | Screenshots     │  ← Top Nav
├─────────────────────────────────────┤
│                                     │
│  Command Center                     │  ← Main Input
│  [Input] [Save] [Visible] [Execute]│
│                                     │
│  ✓ Result Display                  │  ← Feedback
│                                     │
│  Example Commands (6)               │  ← Quick Start
│                                     │
│  Recent Commands (20)               │  ← History
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Workflow Actions

1. **Save**: 💾 icon on main page
2. **Run**: Click "Run Workflow" in library
3. **Edit**: ✏️ icon on workflow card
4. **Delete**: 🗑️ icon on workflow card
5. **Export**: "Export All" button
6. **Import**: "Import" button + JSON file

---

## 📸 Screenshot Actions

1. **Capture**: Run command with `screenshot`
2. **View**: Click thumbnail in gallery
3. **Download**: 💾 button
4. **Delete**: 🗑️ button
5. **Delete All**: "Clear All" button

---

## 🎯 Command Patterns

### Navigation
```
go to <url>
visit <url>
navigate to <url>
```

### Interaction
```
click <text|selector>
fill <field> with <value>
type <text> in <selector>
press <key>
```

### Advanced
```
hover over <selector>
scroll <direction>
select "<option>" from <selector>
wait for <selector> to appear
```

### Data
```
extract links
get text from <selector>
screenshot
download
```

---

## 💾 Storage Limits

- **Workflows**: Unlimited
- **Screenshots**: 50 (auto-cleanup)
- **History**: 20 commands
- **localStorage**: ~5-10MB total

---

## 🚀 Performance Tips

1. Use headless mode for production
2. Minimize screenshots
3. Clear old history regularly
4. Use specific selectors (IDs > classes)
5. Add appropriate waits

---

## 📱 Mobile Usage

All features work on mobile:
- Touch-optimized buttons
- Responsive layouts
- Swipe-friendly galleries
- Mobile keyboard support

---

## 🔗 API Usage

```bash
# Execute command
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_key" \
  -d '{"task": "go to github.com", "headless": true}'

# Get templates
curl http://localhost:3000/api/workflows \
  -H "x-api-key: your_key"
```

---

## 📚 Documentation

- **README.md** - Main overview
- **FEATURES.md** - Detailed features
- **IMPLEMENTATION-COMPLETE.md** - Technical details
- **QUICK-REFERENCE.md** - This guide

---

## 🎓 Learning Path

1. **Start Here**: Try example commands
2. **Next**: Save your first workflow
3. **Then**: Explore new commands
4. **Finally**: Build complex automations

---

## ⚡ Command Cheat Sheet

| Category | Command Example |
|----------|----------------|
| Navigate | `go to github.com` |
| Click | `click login button` |
| Fill | `fill email with test@test.com` |
| Scroll | `scroll down 500` |
| Hover | `hover over .menu` |
| Select | `select "Blue" from #color` |
| Wait | `wait for #result to appear` |
| Extract | `get text from h1` |
| Capture | `screenshot` |

---

## 🌟 Best Practices

✅ **DO**:
- Use specific selectors
- Chain related commands
- Save successful workflows
- Test in visible mode first
- Add waits for dynamic content

❌ **DON'T**:
- Use long fixed waits
- Nest workflows too deep
- Store sensitive data in workflows
- Skip error messages
- Ignore screenshot limits

---

## 🎉 You're Ready!

Start with simple commands, build complexity, and save your workflows!

**Need help?** Check FEATURES.md for detailed documentation.

---

**Version**: 2.0.0  
**Last Updated**: November 2025
