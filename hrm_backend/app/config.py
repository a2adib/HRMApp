from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Default to SQLite for development. Switch to PostgreSQL in production:
    # postgresql+asyncpg://hrmapp:hrmapp_secret@localhost:5432/hrmapp
    database_url: str = "sqlite+aiosqlite:///./hrmapp.db"
    jwt_secret: str = "super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440

    model_config = {"env_file": ".env"}


settings = Settings()
