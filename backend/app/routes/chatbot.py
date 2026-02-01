from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from typing import Optional
from app.config import settings

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# Get Gemini API key from settings
GEMINI_API_KEY = settings.gemini_api_key or ""

# System prompt for the medical assistant
SYSTEM_PROMPT = """You are HealHeart AI, a comprehensive health and medicine assistant for the HealHeart Emergency Medicine Locator app. 

YOUR CAPABILITIES:
1. **Medicines & Drugs**: Explain uses, dosages, side effects, interactions, alternatives for ALL medicines - from common painkillers to specialized medications
2. **Symptoms & Conditions**: Help identify what medicine might be needed for various symptoms
3. **Diet & Nutrition**: Provide dietary advice for health conditions, weight management, and general wellness
4. **Skincare**: Advise on skincare routines, acne treatments, serums, moisturizers, and dermatological products
5. **Haircare**: Help with hair loss treatments (like Minoxidil), hair growth serums, dandruff solutions
6. **Supplements & Vitamins**: Explain benefits, dosages, and when to take supplements
7. **Medical Procedures**: Provide basic information about surgeries, treatments, and recovery
8. **Health Tips**: Offer preventive health advice and lifestyle recommendations

RESPONSE STYLE:
- Be CONCISE and TO THE POINT - no unnecessary fluff
- Use bullet points for clarity
- Highlight important warnings in bold
- Keep responses under 150 words unless detailed info is requested
- Use simple terms anyone can understand
- Always include a brief disclaimer when appropriate

FORMAT MEDICINE NAMES:
- Always write medicine names in **bold** format like **Paracetamol**

IMPORTANT:
- For serious symptoms, always recommend consulting a doctor
- Never diagnose conditions - only provide information
- Mention common brand names when relevant for India market"""


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Send a message to the AI chatbot and get a response.
    The Gemini API call is made from the backend for security.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Gemini API key not configured on server"
        )
    
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )
    
    try:
        # Prepare the prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {request.message}\n\nAssistant:"
        
        # Make request to Gemini API - using gemini-2.0-flash (available model)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [
                        {
                            "parts": [
                                {"text": full_prompt}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 500,
                    }
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                error_detail = response.text
                print(f"Gemini API error: {response.status_code} - {error_detail}")
                return ChatResponse(
                    response="I'm having trouble connecting to my knowledge base. Please try again in a moment.",
                    success=False,
                    error=f"API returned {response.status_code}"
                )
            
            data = response.json()
            
            # Extract the response text
            ai_response = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "I'm sorry, I couldn't process that. Please try again.")
            )
            
            return ChatResponse(
                response=ai_response,
                success=True
            )
            
    except httpx.TimeoutException:
        return ChatResponse(
            response="The request timed out. Please try again.",
            success=False,
            error="Request timeout"
        )
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        return ChatResponse(
            response="I'm having trouble connecting right now. Please try again in a moment.",
            success=False,
            error=str(e)
        )


@router.get("/health")
async def chatbot_health():
    """Check if the chatbot service is configured properly"""
    return {
        "status": "healthy" if GEMINI_API_KEY else "unconfigured",
        "api_key_configured": bool(GEMINI_API_KEY)
    }
