# Dynamic Form Filler - Installation Guide

## Overview

This Chrome extension uses **Dedalus LLM** to intelligently fill ANY form with ZERO hard-coding. It works with:
- ✅ SmartRecruiters
- ✅ Workday
- ✅ Greenhouse
- ✅ Lever
- ✅ Custom React/Vue/Angular forms
- ✅ Any other form structure

## Architecture

```
Chrome Extension (JavaScript)
      ↓ WebSocket/HTTP
Python Backend (FastAPI + Dedalus)
      ↓ API Calls
OpenAI GPT-4 (via Dedalus)
```

---

## Step 1: Install Python Backend

### 1.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Configure API Keys

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Get Dedalus API key from https://dedalus.ai
DEDALUS_API_KEY=your_key_here

# Get OpenAI API key from https://platform.openai.com
OPENAI_API_KEY=sk-your_key_here

PORT=8000
```

### 1.3 Start the Backend Server

```bash
python server.py
```

You should see:

```
🚀 Dynamic Form Filler Backend Server
📡 HTTP API: http://localhost:8000
🔌 WebSocket: ws://localhost:8000/ws
📚 API Docs: http://localhost:8000/docs
```

**Keep this terminal window open!**

---

## Step 2: Install Chrome Extension

### 2.1 Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the project directory: `/Users/j_kanishkha/ai-tinkerer-hackathon`

### 2.2 Verify Installation

You should see:
- Extension icon in Chrome toolbar
- Name: "AI Tinkerer - Dynamic Form Filler"
- Version: 2.0

---

## Step 3: Set Up Your Profile

1. Click the extension icon in Chrome toolbar
2. Click **"Manage Profile"**
3. Fill in your information:
   - Personal Info (name, email, phone, address)
   - Professional Info (experience, skills, education)
   - Upload your resume (optional)
4. Click **Save Profile**

---

## Step 4: Test It Out

### Quick Test

1. Open [test-form.html](test-form.html) in Chrome
2. Click extension icon
3. Click **"Detect Form"** - should find ~10 fields
4. Click **"Fill Form"** - watch it intelligently fill!

### Test on SmartRecruiters

1. Go to any SmartRecruiters job application
2. Click **"Detect Form"**
3. Click **"Fill Form"**
4. Watch the magic! ✨

---

## How It Works

### 1. Form Detection

When you click "Detect Form":

```javascript
// Extension extracts form HTML
const formHTML = document.querySelector('form').outerHTML;

// Sends to backend
POST /api/analyze-form
{
  "html": "<form>...</form>",
  "url": "https://example.com/apply",
  "user_profile": { ... }
}
```

### 2. LLM Analysis

Backend uses Dedalus to analyze the form:

```python
response = await runner.run(
    input=f"Analyze this form and map fields to user data: {html}",
    model="openai/gpt-4o-mini"
)
```

Returns:
```json
{
  "field_mappings": [
    {
      "field_purpose": "first_name",
      "selector": "input[name='firstName']",
      "value": "John",
      "confidence": 0.95
    }
  ]
}
```

### 3. Intelligent Filling

Extension executes the instructions:

```javascript
// Works with ANY input type
await fillField(element, value);

// Works with ANY dropdown (native or custom)
await selectDropdownOption(element, value);

// Handles React/Vue/Angular events
element.dispatchEvent(new Event('input', { bubbles: true }));
```

---

## Features

### ✅ Zero Hard-Coding

No pre-defined selectors. LLM analyzes each form dynamically.

### ✅ Smart Dropdown Selection

```javascript
// LLM picks best option even with abbreviations
options: ["United States of America", "Canada", "Mexico"]
desired: "USA"
→ Selects "United States of America"
```

### ✅ Works with Custom Components

- React Select
- Material-UI dropdowns
- Ant Design forms
- Shadow DOM elements
- Content-editable fields

### ✅ Multi-Step Forms

WebSocket connection allows real-time guidance through multi-page forms.

### ✅ Error Recovery

If filling fails, LLM suggests alternative strategies.

---

## Troubleshooting

### Backend not connecting

**Error:** "Backend connection error. Make sure server is running."

**Fix:**
```bash
cd backend
python server.py
```

### Form not detected

**Error:** "No form detected on this page"

**Possible causes:**
- Form loads via AJAX after page load → Wait a moment and retry
- Form is in iframe → Currently not supported
- Form uses Shadow DOM → Should work, but may need adjustment

### API Rate Limits

Using GPT-4o-mini costs ~$0.15 per 1M input tokens. Each form analysis uses ~1,000 tokens = $0.00015 per form.

**To reduce costs:**
- Use caching (forms rarely change)
- Switch to local LLM (Llama, Mistral)
- Batch analyze multiple forms

---

## Advanced Configuration

### Use Local LLM

Edit `form_analyzer.py`:

```python
response = await self.runner.run(
    input=prompt,
    model="ollama/llama3"  # Local Llama model
)
```

### Add Screenshots

For even better analysis:

```javascript
// In dynamic-form-filler.js
const screenshot = await captureScreenshot();

fetch('/api/analyze-form', {
  body: JSON.stringify({
    html: formHTML,
    screenshot: screenshot  // Base64 encoded
  })
});
```

### Custom Field Mappings

Create user-defined mappings for specific sites:

```json
{
  "site_overrides": {
    "smartrecruiters.com": {
      "phone_format": "XXX-XXX-XXXX",
      "date_format": "MM/DD/YYYY"
    }
  }
}
```

---

## Security & Privacy

### Data Storage

- Profile data stored **locally** in Chrome storage
- Never sent to third parties (except LLM API)
- Backend server runs **locally on your machine**

### API Keys

- Stored in backend `.env` file
- Never exposed to browser
- Use environment variables in production

### HTTPS

For production, use HTTPS:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

---

## Next Steps

1. ✅ Test on various job sites
2. Add screenshot analysis for better accuracy
3. Implement form history/analytics
4. Add multi-profile support
5. Create browser extension for Firefox/Safari

---

## Support

**Issues?** Open an issue on GitHub

**Questions?** Check the API docs at http://localhost:8000/docs

**Want to contribute?** PRs welcome!

---

## Cost Estimate

Using GPT-4o-mini via Dedalus:

- **Per form:** ~1,000 tokens = $0.00015
- **Per dropdown:** ~200 tokens = $0.00003
- **100 applications:** ~$0.02

Very affordable! 🎉
