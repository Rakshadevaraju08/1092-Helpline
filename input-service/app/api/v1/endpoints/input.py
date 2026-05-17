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
    text = request.text.strip()
    original = request.originalText.strip()

    # Edge case 1 — Empty text
    if not text and not original:
        raise HTTPException(
            status_code=400,
            detail="No text provided. Please send valid input."
        )

    # Edge case 2 — Only numbers/symbols
    working_text = original or text
    if working_text.replace(" ", "").isnumeric():
        return {
            "text": working_text,
            "language": "English",
            "originalText": working_text,
            "warning": "Input contains only numbers"
        }

    # Edge case 3 — Too short (less than 2 chars)
    if len(working_text) < 2:
        raise HTTPException(
            status_code=400,
            detail="Input too short. Please describe your emergency."
        )

    try:
        language = translation_service.detect_language(working_text)
        translated_text = await translation_service.translate_to_english(
            working_text, language
        )

        # Edge case 4 — Translation returned empty
        if not translated_text or translated_text.strip() == "":
            translated_text = working_text

        # Edge case 5 — Unknown language (translation same as input)
        if translated_text == working_text and language != "English":
            language = "Unknown"

        return {
            "text": translated_text,
            "language": language,
            "originalText": working_text
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline input error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Service error. Please try again."
        )