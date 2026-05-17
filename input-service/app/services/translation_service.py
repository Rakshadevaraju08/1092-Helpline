import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.sarvam_api_key = settings.SARVAM_API_KEY
        self.sarvam_url = "https://api.sarvam.ai/translate"

    def detect_language(self, text: str) -> str:
        kannada_chars = any('\u0C80' <= c <= '\u0CFF' for c in text)
        hindi_chars = any('\u0900' <= c <= '\u097F' for c in text)
        tamil_chars = any('\u0B80' <= c <= '\u0BFF' for c in text)
        telugu_chars = any('\u0C00' <= c <= '\u0C7F' for c in text)

        if kannada_chars:
            return "Kannada"
        elif hindi_chars:
            return "Hindi"
        elif tamil_chars:
            return "Tamil"
        elif telugu_chars:
            return "Telugu"
        else:
            return "English"

    async def translate_to_english(self, text: str, source_language: str) -> str:
        if source_language == "English":
            return text

        try:
            lang_code_map = {
                "Kannada": "kn-IN",
                "Hindi": "hi-IN",
                "Tamil": "ta-IN",
                "Telugu": "te-IN"
            }
            source_code = lang_code_map.get(source_language, "kn-IN")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.sarvam_url,
                    headers={
                        "api-subscription-key": self.sarvam_api_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "input": text,
                        "source_language_code": source_code,
                        "target_language_code": "en-IN",
                        "model": "mayura:v1",
                        "enable_preprocessing": True
                    },
                    timeout=10.0
                )
                result = response.json()
                translated = result.get("translated_text", text)
                logger.info(f"Translated: {translated}")
                return translated

        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text

translation_service = TranslationService()