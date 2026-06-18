from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    frontend_url: str = "http://localhost:3000"
    google_places_api_key: str = ""  # optional
    environment: str = "development"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
