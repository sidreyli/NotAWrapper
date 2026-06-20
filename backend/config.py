from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    anthropic_api_key: str
    frontend_url: str = "http://localhost:5173"
    frontend_origin_regex: str = ""
    google_places_api_key: str = ""  # optional
    google_maps_server_api_key: str = ""  # optional; falls back to Places key
    resource_user_agent: str = "AidCompass/1.0 (public-benefits-resource-finder)"
    google_calendar_client_id: str = ""
    google_calendar_client_secret: str = ""
    google_calendar_redirect_uri: str = "http://localhost:8000/api/calendar/google/callback"
    calendar_state_secret: str = ""
    environment: str = "development"
    log_level: str = "INFO"

settings = Settings()
