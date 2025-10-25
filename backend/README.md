# Dynamic Form Filler Backend

LLM-powered backend server for intelligent form filling using Dedalus.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the server:**
   ```bash
   python server.py
   ```

   The server will start at:
   - HTTP API: http://localhost:8000
   - WebSocket: ws://localhost:8000/ws
   - API Docs: http://localhost:8000/docs

## API Endpoints

### POST /api/analyze-form
Analyze a form and get intelligent field mappings.

**Request:**
```json
{
  "html": "<form>...</form>",
  "url": "https://example.com/apply",
  "user_profile": {
    "personalInfo": { ... },
    "professionalInfo": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "form_type": "job_application",
  "confidence": 0.95,
  "field_mappings": [
    {
      "field_purpose": "first_name",
      "selector": "input[name='firstName']",
      "value": "John",
      "confidence": 0.95
    }
  ],
  "instructions": [
    {
      "step": 1,
      "action": "fill",
      "selector": "input[name='firstName']",
      "value": "John"
    }
  ]
}
```

### POST /api/smart-dropdown
Intelligently select the best option from a dropdown.

### WebSocket /ws
Real-time bidirectional communication for guided form filling.

## Features

- **Zero Hard-coding**: Uses LLM to understand any form structure
- **Intelligent Matching**: Handles fuzzy matching, abbreviations, synonyms
- **Error Recovery**: Provides alternative strategies when filling fails
- **Multi-step Forms**: Guides through complex multi-page forms
- **Custom Dropdowns**: Works with any dropdown implementation

## Architecture

```
Chrome Extension → HTTP/WebSocket → FastAPI Server → Dedalus → OpenAI GPT-4
```
