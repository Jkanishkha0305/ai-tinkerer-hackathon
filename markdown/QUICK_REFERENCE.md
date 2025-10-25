# 📋 Quick Reference Card

## 🚀 Setup Commands

```bash
# Backend setup
cd backend
cp .env.example .env
nano .env  # Add your API keys
./start_backend.sh

# Test backend
python test_backend.py

# Manual start
python server.py
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| WebSocket | ws://localhost:8000/ws |
| Extensions | chrome://extensions/ |

## 🔑 Required API Keys

Add to `backend/.env`:
```bash
DEDALUS_API_KEY=your_dedalus_key
OPENAI_API_KEY=sk-your_openai_key
```

Get keys:
- Dedalus: https://dedalus.ai
- OpenAI: https://platform.openai.com

## 🎯 Extension Usage

### Step-by-Step
1. Navigate to any form
2. Click extension icon
3. Click **"Detect Form"** → See field count
4. Click **"Fill Form"** → Watch it fill!

### First Time Setup
1. Click extension icon
2. Click **"Manage Profile"**
3. Fill in your information
4. Click **"Save Profile"**

## 📁 Key Files

### Backend
| File | Purpose |
|------|---------|
| `server.py` | FastAPI server + endpoints |
| `form_analyzer.py` | LLM form analysis logic |
| `.env` | API keys (create from .env.example) |
| `test_backend.py` | Backend tests |

### Extension
| File | Purpose |
|------|---------|
| `dynamic-form-filler.js` | Main form filler (NEW!) |
| `popup.js` | Extension UI |
| `profile.js` | Profile management |
| `manifest.json` | Extension config |

### Documentation
| File | Purpose |
|------|---------|
| `QUICKSTART.md` | 5-minute setup |
| `INSTALLATION.md` | Detailed setup |
| `COMPARISON.md` | Before vs After |
| `ARCHITECTURE.md` | System architecture |
| `SUMMARY.md` | Project summary |

## 🔧 API Endpoints

### POST /api/analyze-form
Analyze form structure and get field mappings.

**Request:**
```json
{
  "html": "<form>...</form>",
  "url": "https://example.com",
  "user_profile": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "form_type": "job_application",
  "confidence": 0.95,
  "field_mappings": [...],
  "instructions": [...]
}
```

### POST /api/smart-dropdown
Select best option from dropdown using LLM.

**Request:**
```json
{
  "options": ["Option 1", "Option 2"],
  "desired_value": "My value",
  "context": "Field description"
}
```

**Response:**
```json
{
  "success": true,
  "selected_option": "Option 1",
  "confidence": 0.90,
  "reasoning": "..."
}
```

### WebSocket /ws
Real-time communication for multi-step forms.

**Messages:**
```json
// Form analysis
{ "action": "analyze_form", "html": "...", ... }

// Get next action
{ "action": "get_next_action", "current_state": {...} }

// Report error
{ "action": "error", "error": "...", "field": {...} }
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Need 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists
ls -la .env

# Check API keys
cat .env | grep API_KEY
```

### Extension not working
```bash
# 1. Check backend is running
curl http://localhost:8000

# 2. Check extension console
# Open extension popup → Right-click → Inspect → Console

# 3. Reload extension
# chrome://extensions/ → Reload button
```

### Form not detected
1. Wait for page to fully load
2. Check if form exists: `document.querySelectorAll('form').length`
3. Try again after a few seconds
4. Check console for errors

### Form not filling
1. Check backend is connected (look for WebSocket message in console)
2. Make sure profile is saved (Manage Profile → Save)
3. Check "Detect Form" works first
4. Look for errors in console

## 💰 Cost Reference

| Action | Tokens | Cost |
|--------|--------|------|
| Analyze 1 form | ~1,000 | $0.00015 |
| Smart dropdown | ~200 | $0.00003 |
| 10 applications | ~10,000 | $0.0015 |
| 100 applications | ~100,000 | $0.015 |

**Model:** GPT-4o-mini via Dedalus

## ⚡ Performance

| Metric | Time |
|--------|------|
| Extract form HTML | 100ms |
| LLM analysis | 1-2s |
| Fill one field | 800ms |
| Fill 10 fields | ~9s |
| Complete application | ~10s |

Compare to manual: **10-15 minutes saved per form!**

## 🔍 Debugging

### Check Backend Connection
```javascript
// In browser console on any page
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('✅ Connected');
ws.onerror = () => console.log('❌ Failed');
```

### Check Extension State
```javascript
// In extension console (inspect popup)
window.dynamicFormFiller.userData  // See profile
window.dynamicFormFiller.currentAnalysis  // See last analysis
```

### Test Backend API
```bash
curl -X POST http://localhost:8000/api/analyze-form \
  -H "Content-Type: application/json" \
  -d '{"html":"<form><input name=\"test\"/></form>","url":"test","user_profile":{}}'
```

## 📊 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Extension | ✅ v88+ | 🔄 Port needed | 🔄 Port needed | ✅ v88+ |
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| File System API | ✅ v86+ | ❌ | ❌ | ✅ v86+ |
| Shadow DOM | ✅ | ✅ | ✅ | ✅ |

## 🎓 Common Scenarios

### Scenario 1: Job Application
```
1. Go to company careers page
2. Click "Apply"
3. Click extension → Detect Form
4. Click Fill Form
5. Review filled data
6. Click Submit
```

### Scenario 2: Multi-Page Form
```
1. Fill page 1 → Extension fills automatically
2. Click "Next"
3. Fill page 2 → Extension fills automatically
4. Click "Next"
5. Upload resume → Manual click (browser security)
6. Click "Submit"
```

### Scenario 3: Custom Dropdown
```
1. Extension detects dropdown
2. Extracts all options
3. Sends to LLM with your desired value
4. LLM picks best match (handles abbreviations)
5. Extension clicks selected option
```

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Quick Start | [QUICKSTART.md](QUICKSTART.md) |
| Full Setup | [INSTALLATION.md](INSTALLATION.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| API Docs | http://localhost:8000/docs |
| GitHub Issues | (your repo) |

## 💡 Tips & Tricks

### Tip 1: Keyboard Shortcuts
Add to `manifest.json`:
```json
"commands": {
  "detect-form": {
    "suggested_key": { "default": "Ctrl+Shift+D" },
    "description": "Detect form"
  },
  "fill-form": {
    "suggested_key": { "default": "Ctrl+Shift+F" },
    "description": "Fill form"
  }
}
```

### Tip 2: Multiple Profiles
Create multiple `.env` profiles:
```bash
.env.work     # Work applications
.env.personal # Personal applications
```

Switch: `cp .env.work .env && python server.py`

### Tip 3: Batch Processing
```javascript
// Fill multiple tabs
const tabs = await chrome.tabs.query({});
for (const tab of tabs) {
  await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
}
```

### Tip 4: Custom Mappings
Override LLM decisions:
```javascript
// In dynamic-form-filler.js
const customMappings = {
  'careers.google.com': {
    'phone': '+1-555-0100',  // Always use this phone
    'format': 'US'
  }
};
```

## 🎯 Success Checklist

Before using:
- [ ] Backend running on :8000
- [ ] Extension loaded in Chrome
- [ ] Profile saved with your info
- [ ] API keys configured in .env
- [ ] Test on test-form.html works

For each application:
- [ ] Page fully loaded
- [ ] Clicked "Detect Form"
- [ ] Saw field count message
- [ ] Clicked "Fill Form"
- [ ] Reviewed filled data
- [ ] Manually uploaded resume (if needed)
- [ ] Submitted form

## 🚨 Common Errors

### "Backend connection error"
**Fix:** Start backend with `python server.py`

### "No form detected"
**Fix:** Wait for page load, or form is in iframe (not supported yet)

### "Analysis failed"
**Fix:** Check API keys in .env, check internet connection

### "Field not found"
**Fix:** Form structure changed, let LLM re-analyze

## 📈 Metrics to Track

- Forms filled: Count successful fills
- Success rate: % of fields filled correctly
- Time saved: Manual time - Automated time
- Cost: API usage × token price
- Confidence: Average LLM confidence scores

## 🎉 You're Ready!

Everything you need to know in one place. Now go fill some forms! 🚀

**Quick start:** [QUICKSTART.md](QUICKSTART.md)
