import os
from pydantic_settings import BaseSettings

# Build paths inside the project relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "1092 Helpline AI Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # AI Model Configurations
    DEBERTA_MODEL_NAME: str = "cross-encoder/nli-deberta-v3-small"

    # Groq Configuration
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_MODEL_NAME: str = "llama-3.3-70b-versatile"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Sarvam Configuration (from merged input-service)
    SARVAM_API_KEY: str = ""

    class Config:
        env_file = ENV_PATH
        extra = "ignore"

settings = Settings()