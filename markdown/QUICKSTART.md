# 🚀 Quick Start - Dynamic Form Filler

Get up and running in **5 minutes**!

## Prerequisites

- ✅ Python 3.8+
- ✅ Chrome browser
- ✅ API Keys:
  - Dedalus API key (from https://dedalus.ai)
  - OpenAI API key (from https://platform.openai.com)

---

## 1️⃣ Start Backend Server (2 minutes)

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use any editor

# Install dependencies and start server
./start_backend.sh
```

**Expected output:**
```
🚀 Dynamic Form Filler Backend Server
📡 HTTP API: http://localhost:8000
🔌 WebSocket: ws://localhost:8000/ws
```

✅ **Leave this terminal open!**

---

## 2️⃣ Install Chrome Extension (1 minute)

1. Open Chrome: `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this directory
5. Done! ✨

---

## 3️⃣ Set Up Your Profile (1 minute)

1. Click extension icon in toolbar
2. Click **"Manage Profile"**
3. Fill in your info
4. Click **Save**

---

## 4️⃣ Test It! (1 minute)

### Quick Test

```bash
# Open test form
open test-form.html
```

1. Click extension icon
2. Click **"Detect Form"**
3. Click **"Fill Form"**
4. Watch it work! 🎉

### Real-World Test

1. Go to any job application (SmartRecruiters, Greenhouse, etc.)
2. Click **"Detect Form"**
3. Click **"Fill Form"**
4. Marvel at the intelligence! 🤖

---

## That's It!

You now have a **fully intelligent, zero-hard-coded** form filler that works with **ANY** form structure.

**No more manually filling out applications!** 🎊

---

## What Makes This Special?

### Traditional Form Fillers
```javascript
// Hard-coded selectors (brittle!)
if (document.querySelector('input[name="firstName"]')) {
  // Fill first name
}
```
❌ Breaks when forms change
❌ Doesn't work with custom forms
❌ Can't handle new field types

### This Form Filler
```javascript
// LLM analyzes the form dynamically
const analysis = await analyzeWithLLM(formHTML);
// Intelligently fills ANY structure
await fillIntelligently(analysis);
```
✅ Works with ANY form
✅ Adapts to changes automatically
✅ Handles custom components
✅ Multi-step forms
✅ Error recovery

---

## Troubleshooting

### Backend won't start?

```bash
# Install Python dependencies manually
pip install fastapi uvicorn websockets dedalus-labs python-dotenv
```

### Extension not loading?

- Make sure Developer mode is ON
- Check for errors in `chrome://extensions/`
- Try reloading the extension

### Form not filling?

1. Check backend is running (http://localhost:8000)
2. Open DevTools console for errors
3. Try "Detect Form" first
4. Make sure profile is saved

---

## Next Steps

- Read [INSTALLATION.md](INSTALLATION.md) for detailed setup
- Check backend API docs: http://localhost:8000/docs
- Test on different job sites
- Customize for your use case

---

## Cost

Using GPT-4o-mini via Dedalus:
- **Per form:** ~$0.00015
- **100 applications:** ~$0.02

Incredibly affordable! 💰

---

## Support

**Need help?** Check the detailed [INSTALLATION.md](INSTALLATION.md)

**Found a bug?** Open an issue

**Want to contribute?** PRs welcome!
