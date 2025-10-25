"""
Dynamic Form Filler Backend Server
Uses Dedalus for LLM-powered form analysis
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import asyncio
import json
from dotenv import load_dotenv
import os
from form_analyzer import FormAnalyzer

load_dotenv()

app = FastAPI(title="Dynamic Form Filler Backend")

# Enable CORS for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize form analyzer with Dedalus
form_analyzer = FormAnalyzer()

# Active WebSocket connections
active_connections: List[WebSocket] = []


class FormAnalysisRequest(BaseModel):
    html: str
    url: str
    user_profile: Dict[str, Any]
    screenshot: Optional[str] = None  # Base64 encoded screenshot


class FormAnalysisResponse(BaseModel):
    success: bool
    field_mappings: List[Dict[str, Any]]
    instructions: List[Dict[str, Any]]
    confidence: float
    form_type: str
    error: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Dynamic Form Filler Backend Server")
    print(f"📡 WebSocket will be available at: ws://localhost:8000/ws")
    await form_analyzer.initialize()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Dynamic Form Filler Backend",
        "version": "1.0.0",
        "llm_provider": "dedalus"
    }


@app.post("/api/analyze-form", response_model=FormAnalysisResponse)
async def analyze_form(request: FormAnalysisRequest):
    """
    Analyze form structure using LLM and return field mappings

    This endpoint:
    1. Takes the form HTML + user profile
    2. Uses Dedalus LLM to understand the form structure
    3. Returns intelligent field mappings and filling instructions
    """
    try:
        print(f"📝 Analyzing form from: {request.url}")

        # Use LLM to analyze the form
        analysis = await form_analyzer.analyze_form(
            html=request.html,
            url=request.url,
            user_profile=request.user_profile,
            screenshot=request.screenshot
        )

        return FormAnalysisResponse(
            success=True,
            field_mappings=analysis['field_mappings'],
            instructions=analysis['instructions'],
            confidence=analysis['confidence'],
            form_type=analysis['form_type'],
            error=None
        )

    except Exception as e:
        print(f"❌ Error analyzing form: {str(e)}")
        return FormAnalysisResponse(
            success=False,
            field_mappings=[],
            instructions=[],
            confidence=0.0,
            form_type="unknown",
            error=str(e)
        )


@app.post("/api/analyze-field")
async def analyze_field(field_html: str, label_text: str, user_data: Dict):
    """
    Analyze a specific field and determine the best value to fill
    """
    try:
        value = await form_analyzer.determine_field_value(
            field_html=field_html,
            label_text=label_text,
            user_data=user_data
        )

        return {
            "success": True,
            "value": value,
            "confidence": value.get('confidence', 0.5)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time form filling guidance
    """
    await websocket.accept()
    active_connections.append(websocket)
    print(f"🔌 WebSocket connected. Total connections: {len(active_connections)}")

    try:
        while True:
            # Receive message from extension
            data = await websocket.receive_text()
            message = json.loads(data)

            action = message.get('action')

            if action == 'analyze_form':
                # Real-time form analysis
                response = await form_analyzer.analyze_form(
                    html=message['html'],
                    url=message['url'],
                    user_profile=message['user_profile']
                )
                await websocket.send_json({
                    "type": "form_analysis",
                    "data": response
                })

            elif action == 'get_next_action':
                # Get next filling action
                next_action = await form_analyzer.get_next_filling_action(
                    current_state=message['current_state'],
                    filled_fields=message['filled_fields']
                )
                await websocket.send_json({
                    "type": "next_action",
                    "data": next_action
                })

            elif action == 'field_filled':
                # Acknowledge field was filled
                await websocket.send_json({
                    "type": "ack",
                    "field": message['field_name'],
                    "status": "success"
                })

            elif action == 'error':
                # Handle error - ask LLM for alternative approach
                alternative = await form_analyzer.get_alternative_strategy(
                    error=message['error'],
                    field=message['field']
                )
                await websocket.send_json({
                    "type": "alternative_strategy",
                    "data": alternative
                })

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"🔌 WebSocket disconnected. Total connections: {len(active_connections)}")
    except Exception as e:
        print(f"❌ WebSocket error: {str(e)}")
        if websocket in active_connections:
            active_connections.remove(websocket)


@app.post("/api/smart-dropdown")
async def smart_dropdown_selection(
    dropdown_html: str,
    options: List[str],
    desired_value: str,
    context: str
):
    """
    Use LLM to select the best option from a dropdown
    Handles fuzzy matching, abbreviations, synonyms
    """
    try:
        selected = await form_analyzer.select_dropdown_option(
            options=options,
            desired_value=desired_value,
            context=context
        )

        return {
            "success": True,
            "selected_option": selected['option'],
            "confidence": selected['confidence'],
            "reasoning": selected['reasoning']
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


class ChatRequest(BaseModel):
    message: str
    page_url: str
    page_context: Optional[Dict] = None


@app.post("/api/chat")
async def chat_with_page(request: ChatRequest):
    """
    Chat endpoint for voice/text interaction with the page
    User can ask questions or request actions
    """
    try:
        print(f"💬 Chat message: {request.message}")

        # Use LLM to understand the user's intent and respond
        response_text = await form_analyzer.chat_with_context(
            message=request.message,
            page_url=request.page_url,
            page_context=request.page_context or {}
        )

        # Check if LLM suggests an action
        action = None
        if "fill" in request.message.lower() and "form" in request.message.lower():
            action = {"type": "fill_form"}

        return {
            "success": True,
            "response": response_text,
            "action": action
        }

    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "response": "Sorry, I encountered an error processing your message."
        }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))

    print("=" * 60)
    print("🚀 Dynamic Form Filler Backend Server")
    print("=" * 60)
    print(f"📡 HTTP API: http://localhost:{port}")
    print(f"🔌 WebSocket: ws://localhost:{port}/ws")
    print(f"📚 API Docs: http://localhost:{port}/docs")
    print("=" * 60)

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

# Translation endpoint
class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str = "EN"

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    """Translate using DeepL"""
    try:
        from deepl_translator import DeepLTranslator
        translator = DeepLTranslator()
        
        translated = await translator.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
        
        return {
            "success": True,
            "translated_text": translated
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "translated_text": request.text
        }
