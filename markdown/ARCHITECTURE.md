# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    WEB PAGE (Any Form)                     │  │
│  │  • SmartRecruiters, Workday, Greenhouse, Custom forms     │  │
│  │  • React, Vue, Angular, Web Components                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            CHROME EXTENSION (Content Script)               │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  dynamic-form-filler.js                            │  │  │
│  │  │                                                     │  │  │
│  │  │  📋 extractFormStructure()                         │  │  │
│  │  │     • Queries all inputs, selects, textareas      │  │  │
│  │  │     • Extracts labels, aria attributes            │  │  │
│  │  │     • Searches Shadow DOM                         │  │  │
│  │  │     • Checks iframes                              │  │  │
│  │  │                                                     │  │  │
│  │  │  🎯 executeInstruction()                           │  │  │
│  │  │     • findElement() - Smart element finder        │  │  │
│  │  │     • fillField() - Universal field filler        │  │  │
│  │  │     • selectDropdownOption() - LLM-powered        │  │  │
│  │  │     • uploadFile() - File System Access API       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│                    HTTP POST / WebSocket                         │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON BACKEND SERVER                         │
│                      (localhost:8000)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    server.py (FastAPI)                     │  │
│  │                                                            │  │
│  │  🌐 REST API Endpoints:                                   │  │
│  │     POST /api/analyze-form                                │  │
│  │     POST /api/smart-dropdown                              │  │
│  │     POST /api/analyze-field                               │  │
│  │                                                            │  │
│  │  🔌 WebSocket:                                            │  │
│  │     /ws - Real-time bidirectional communication          │  │
│  │     • Multi-step form guidance                           │  │
│  │     • Error recovery                                     │  │
│  │     • Progress updates                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              form_analyzer.py (Core Logic)                 │  │
│  │                                                            │  │
│  │  📝 FormHTMLParser                                        │  │
│  │     • Parses form HTML structure                         │  │
│  │     • Extracts fields, labels, attributes                │  │
│  │                                                            │  │
│  │  🧠 FormAnalyzer                                          │  │
│  │     • analyze_form() - Main analysis                     │  │
│  │     • _create_analysis_prompt() - LLM prompt builder     │  │
│  │     • select_dropdown_option() - Smart dropdown          │  │
│  │     • get_alternative_strategy() - Error recovery        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↕
                          API Calls
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DEDALUS + OPENAI GPT-4                        │
│                                                                  │
│  🤖 Model: openai/gpt-4o-mini                                   │
│  📊 Task: Form structure understanding                          │
│  💡 Output: Intelligent field mappings + instructions           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Form Detection Flow

```
User clicks "Detect Form"
         ↓
Extension extracts form HTML:
{
  html: "<form><input name='firstName' />...</form>",
  url: "https://careers.example.com/apply"
}
         ↓
POST to /api/analyze-form
         ↓
Backend parses HTML → FormHTMLParser
         ↓
Creates LLM prompt with:
  • Form structure
  • User profile data
  • Field context
         ↓
Sends to Dedalus → GPT-4o-mini
         ↓
LLM analyzes and returns:
{
  "form_type": "job_application",
  "confidence": 0.95,
  "field_mappings": [...],
  "instructions": [...]
}
         ↓
Extension receives analysis
         ↓
Shows: "Found 15 fields (95% confidence)"
```

### 2. Form Filling Flow

```
User clicks "Fill Form"
         ↓
Extension iterates through instructions
         ↓
For each instruction:
  ┌─────────────────────────────────┐
  │  1. Find element                │
  │     • querySelector             │
  │     • Shadow DOM search         │
  │     • iframe search             │
  └─────────────────────────────────┘
         ↓
  ┌─────────────────────────────────┐
  │  2. Determine action            │
  │     • fill → fillField()        │
  │     • select → selectDropdown() │
  │     • upload → uploadFile()     │
  │     • click → clickElement()    │
  └─────────────────────────────────┘
         ↓
  ┌─────────────────────────────────┐
  │  3. Execute action              │
  │     • Scroll into view          │
  │     • Focus element             │
  │     • Fill/Select value         │
  │     • Dispatch events           │
  └─────────────────────────────────┘
         ↓
  ┌─────────────────────────────────┐
  │  4. Verify & continue           │
  │     • Mark as filled            │
  │     • Notify via WebSocket      │
  │     • Delay 800ms               │
  └─────────────────────────────────┘
         ↓
All fields filled → Show success notification
```

### 3. Smart Dropdown Flow

```
Extension encounters dropdown
         ↓
Tries to open dropdown:
  • Click trigger element
  • Wait 500ms for options
         ↓
Extract visible options:
["0-1 years", "1-3 years", "3-5 years", "5+ years"]
         ↓
POST to /api/smart-dropdown:
{
  "options": [...],
  "desired_value": "5 years experience",
  "context": "Years of experience field"
}
         ↓
LLM analyzes:
  • Compares desired value to options
  • Handles abbreviations (USA → United States)
  • Handles synonyms (Yes → I am authorized)
  • Returns best match
         ↓
Returns:
{
  "selected_option": "5+ years",
  "confidence": 0.90,
  "reasoning": "User has 5 years, '5+ years' is best match"
}
         ↓
Extension clicks matching option
         ↓
Dropdown filled ✓
```

---

## Component Breakdown

### Chrome Extension Components

#### 1. dynamic-form-filler.js (580 lines)
**Main class:** `DynamicFormFiller`

**Key methods:**
- `extractFormStructure()` - Extracts HTML from page
- `detectAndAnalyzeForm()` - Sends to backend
- `fillFormIntelligently()` - Executes instructions
- `findElement()` - Smart element finder
- `fillField()` - Universal field filler
- `selectDropdownOption()` - Dropdown handler
- `uploadFile()` - File upload handler

**Special features:**
- Shadow DOM search
- iframe support
- React/Vue/Angular compatibility
- WebSocket real-time communication

#### 2. popup.js (122 lines)
**Purpose:** Extension popup UI

**Features:**
- Detect Form button
- Fill Form button
- Manage Profile button
- Status messages

#### 3. profile.js (200+ lines)
**Purpose:** User profile management

**Features:**
- Form for personal/professional info
- Auto-save (1s debounce)
- Export/Import JSON
- Resume file handling

#### 4. background.js (130 lines)
**Purpose:** Service worker

**Features:**
- Context menu items
- Message routing
- Settings management
- Tab update listeners

---

### Backend Components

#### 1. server.py (270 lines)
**Framework:** FastAPI

**Endpoints:**
```python
GET  /                     # Health check
POST /api/analyze-form     # Main form analysis
POST /api/smart-dropdown   # Dropdown selection
POST /api/analyze-field    # Single field analysis
WS   /ws                   # WebSocket connection
```

**Features:**
- CORS middleware for extension
- WebSocket connection manager
- Error handling
- Request/response validation

#### 2. form_analyzer.py (450 lines)
**Main class:** `FormAnalyzer`

**Key components:**

##### FormHTMLParser
```python
class FormHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        # Extract form elements

    def handle_data(self, data):
        # Capture label text
```

##### FormAnalyzer
```python
class FormAnalyzer:
    async def analyze_form(self, html, url, user_profile):
        # 1. Parse HTML
        # 2. Build context
        # 3. Create LLM prompt
        # 4. Get LLM response
        # 5. Parse and return

    async def select_dropdown_option(self, options, desired_value):
        # Use LLM for semantic matching

    async def get_alternative_strategy(self, error, field):
        # Suggest alternative on failure
```

---

## LLM Prompt Engineering

### Form Analysis Prompt Template

```python
f"""You are an intelligent form filling assistant. Analyze this form and provide field mappings.

FORM STRUCTURE:
{form_context}

AVAILABLE USER DATA:
{available_data}

TASK:
1. Identify each form field's purpose
2. Map each field to user data
3. For dropdowns, suggest best value
4. Provide CSS selectors
5. Indicate confidence level

Return JSON:
{{
  "form_type": "job_application" | "registration" | ...,
  "confidence": 0.0-1.0,
  "field_mappings": [
    {{
      "field_purpose": "first_name",
      "selector": "input[name='firstName']",
      "value": "John",
      "confidence": 0.95
    }}
  ],
  "instructions": [
    {{
      "step": 1,
      "action": "fill",
      "selector": "...",
      "value": "..."
    }}
  ]
}}
"""
```

### Dropdown Selection Prompt

```python
f"""Select the best matching option from this dropdown.

DROPDOWN CONTEXT: {context}
DESIRED VALUE: {desired_value}
AVAILABLE OPTIONS:
{options_list}

Consider:
- Exact matches
- Abbreviations (USA → United States)
- Synonyms (Yes → I am authorized)
- Common conventions

Return JSON:
{{
  "selected_option": "exact text",
  "confidence": 0.0-1.0,
  "reasoning": "why selected"
}}
"""
```

---

## Extension Permissions

### manifest.json

```json
{
  "permissions": [
    "activeTab",      // Access current tab
    "storage",        // Store user profile
    "tabs",           // Query tabs
    "scripting"       // Inject scripts
  ],
  "host_permissions": [
    "http://localhost:8000/*"  // Backend API access
  ]
}
```

---

## State Management

### Extension State

```javascript
class DynamicFormFiller {
  constructor() {
    this.userData = null;           // User profile
    this.currentAnalysis = null;    // LLM analysis result
    this.filledFields = new Set();  // Track filled fields
    this.isFilling = false;         // Prevent concurrent fills
    this.ws = null;                 // WebSocket connection
  }
}
```

### Backend State

```python
# In-memory state
active_connections: List[WebSocket] = []  # Active WS connections
form_analyzer: FormAnalyzer = None        # Analyzer instance
```

---

## Error Handling

### Extension Error Flow

```javascript
try {
  await this.fillField(element, value);
} catch (error) {
  console.error('Fill failed:', error);

  // Ask backend for alternative
  if (this.ws.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({
      action: 'error',
      error: error.message,
      field: fieldData
    }));
  }

  // Backend responds with alternative strategy
  // Extension retries with alternative
}
```

### Backend Error Flow

```python
try:
    analysis = await form_analyzer.analyze_form(...)
    return FormAnalysisResponse(success=True, ...)

except Exception as e:
    logger.error(f"Analysis failed: {e}")
    return FormAnalysisResponse(
        success=False,
        error=str(e),
        field_mappings=[]  # Fallback to empty
    )
```

---

## Performance Optimizations

### 1. Caching (Potential)
```python
# Cache form analyses for same URL
cache = {}

def analyze_form(html, url):
    cache_key = hashlib.md5(html.encode()).hexdigest()

    if cache_key in cache:
        return cache[cache_key]

    result = await llm_analyze(html)
    cache[cache_key] = result
    return result
```

### 2. Batch Processing
```python
# Analyze multiple forms in parallel
async def batch_analyze(forms):
    tasks = [analyze_form(f) for f in forms]
    return await asyncio.gather(*tasks)
```

### 3. Lazy Loading
```javascript
// Only analyze when user clicks "Detect Form"
// Don't auto-analyze every page load
```

---

## Security Considerations

### 1. API Key Protection
```bash
# Backend .env file (never committed)
OPENAI_API_KEY=sk-...
DEDALUS_API_KEY=...
```

### 2. CORS Configuration
```python
# Only allow extension origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://YOUR_ID"],
    allow_credentials=True
)
```

### 3. Input Validation
```python
class FormAnalysisRequest(BaseModel):
    html: str
    url: str
    user_profile: Dict[str, Any]

    @validator('html')
    def validate_html(cls, v):
        if len(v) > 1_000_000:  # 1MB limit
            raise ValueError('HTML too large')
        return v
```

### 4. Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/analyze-form")
@limiter.limit("10/minute")
async def analyze_form(...):
    ...
```

---

## Deployment Options

### Option 1: Local Development (Current)
```
Backend: localhost:8000
Extension: Load unpacked in Chrome
```

### Option 2: Cloud Backend
```
Backend: Deployed to AWS/GCP/Heroku
Extension: Updated manifest with cloud URL
```

### Option 3: Serverless
```
Backend: AWS Lambda + API Gateway
Extension: Calls Lambda functions
```

---

## Monitoring & Logging

### Backend Logs
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Form analyzed: {url}")
logger.error(f"Analysis failed: {error}")
```

### Extension Logs
```javascript
console.log('🔍 Detecting form...');
console.log('📊 Analysis result:', analysis);
console.error('❌ Error:', error);
```

---

## Testing Strategy

### 1. Unit Tests
```python
# backend/test_backend.py
async def test_form_analysis():
    analyzer = FormAnalyzer()
    result = await analyzer.analyze_form(sample_html)
    assert result['confidence'] > 0.8
```

### 2. Integration Tests
```javascript
// Test extension + backend communication
await detectForm();
assert(fieldCount > 0);
```

### 3. Manual Tests
- test-form.html - Generic form
- smartrecruiters-test.html - Real-world simulation

---

This architecture enables **zero-hardcoded, LLM-powered form filling** that works with ANY form! 🚀
