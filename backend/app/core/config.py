import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Audiobook Video Maker"
    API_V1_STR: str = "/api/v1"
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "/app/outputs")
    TEMP_DIR: str = os.getenv("TEMP_DIR", "/app/temp")
    
    # Security / Limits
    MAX_UPLOAD_SIZE: int = 1024 * 1024 * 500 # 500 MB limit per file (not natively enforced by FastAPI easily without custom middleware, but useful for logic)
    ALLOWED_AUDIO_TYPES: list = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"]
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/jpg"]
    
    class Config:
        case_sensitive = True

settings = Settings()
