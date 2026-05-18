import os
from pydantic_settings import BaseSettings

# Build paths inside the project relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "1092 Input Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SARVAM_API_KEY: str = ""

    model_config = {"env_file": ENV_PATH, "extra": "ignore"}

settings = Settings()


