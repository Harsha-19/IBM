import secrets

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./lecturelens.db"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    AI_PROVIDER: str = "mock"
    AI_API_KEY: str = ""
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    UPLOAD_DIR: str = "uploads"
    VALIDATION_THRESHOLD: float = 70.0
    MAX_RETRY_COUNT: int = 3

    class Config:
        env_file = ".env"


settings = Settings()
