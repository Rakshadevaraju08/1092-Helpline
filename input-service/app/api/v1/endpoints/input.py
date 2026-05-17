from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.translation_service import translation_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class TextInputRequest(BaseModel):
    text: str
    originalText: str = ""

@router.post("/input")
async def pipeline_input(request: TextInputRequest):
    try:
        language = translation_service.detect_language(
            request.originalText or request.text
        )
        translated_text = await translation_service.translate_to_english(
            request.originalText or request.text, language
        )
        return {
            "text": translated_text,
            "language": language,
            "originalText": request.originalText or request.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))