from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "1092 Input Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SARVAM_API_KEY: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()

