# Voice Assistant Setup Guide

## What You Have Now

A complete two-way voice communication system:
- System speaks to you (Text-to-Speech)
- You speak to system (Speech-to-Text)
- Translates your native language using DeepL
- Visual indicators for listening/speaking states

## Setup Steps

### 1. Get DeepL API Key (FREE - 5 minutes)

1. Go to: https://www.deepl.com/pro-api
2. Click "Sign up for free"
3. Verify email
4. Go to Account → API Keys
5. Copy your API key

### 2. Add to Backend

```bash
cd backend
nano .env

# Add this line:
DEEPL_API_KEY=your_actual_api_key_here
```

### 3. Install DeepL (if needed)

```bash
pip install aiohttp
```

### 4. Restart Backend

```bash
python server.py
```

### 5. Reload Extension

1. Go to chrome://extensions/
2. Find your extension
3. Click reload icon

## Test the Voice System

### Test 1: Open Test Page

```bash
open voice-test.html
```

Click the buttons to test:
- 🔊 System speaking
- 🎤 Voice listening
- ❓ Question flow
- 🌍 Language setting

### Test 2: Real Form Test

1. Open any form (or test-form.html)
2. Open browser console (F12)
3. Type:

```javascript
// Test speaking
window.voiceAssistant.speak("Hello, this is a test");

// Test asking a question
window.voiceAssistant.askQuestion(
  "What is your email address?",
  "email",
  (field, answer) => {
    console.log(`Got answer for ${field}: ${answer}`);
  }
);

// Set your language (Hindi example)
window.voiceAssistant.setNativeLanguage('HI');
```

## Supported Languages

| Language | Code |
|----------|------|
| English | EN |
| Hindi | HI |
| Tamil | TA |
| Telugu | TE |
| Kannada | KN |
| Malayalam | ML |
| Spanish | ES |
| French | FR |
| German | DE |
| Chinese | ZH |
| Japanese | JA |
| Korean | KO |

## How It Will Work in Forms

```
1. Extension starts filling form
2. Finds empty "address" field
3. System SPEAKS: "What is your address?"
4. Visual indicator shows 🎤 (listening)
5. You SPEAK: "मेरा पता मुंबई है" (in Hindi)
6. Translates: "My address is Mumbai"
7. Fills the field
8. Moves to next field
```

## Visual Indicators

Look for the floating circle on bottom-right of page:

- 🎤 **Pink/pulsing** = Listening to you
- 🔊 **Purple/pulsing** = Speaking to you
- ✓ **Green** = Ready/Idle
- ⚠️ **Red** = Error

## Testing Voice Features

### In Browser Console:

```javascript
// Make system speak
voiceAssistant.speak("Testing voice output");

// Start listening
voiceAssistant.startListening();

// Stop listening
voiceAssistant.stopListening();

// Ask a question and get response
voiceAssistant.askQuestion(
  "What is your name?",
  "name",
  (fieldName, answer) => {
    alert(`You said: ${answer}`);
  }
);

// Change language to Hindi
voiceAssistant.setNativeLanguage('HI');
```

## Troubleshooting

### System not speaking?

Check browser settings:
- Settings → Privacy and security → Site settings
- Sound → Allow sites to play sound

### Microphone not working?

- Chrome will ask for mic permission
- Make sure you clicked "Allow"
- Check System Preferences → Security → Microphone

### Translation not working?

- Make sure DEEPL_API_KEY is in .env
- Backend must be running
- Check backend console for errors

## Next: Integrate with Form Filling

The voice assistant is ready. Next step is to integrate it into your form filling logic so it automatically asks for missing fields.

Would you like me to integrate it now?
