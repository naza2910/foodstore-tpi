from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la aplicación, leída del archivo .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str = Field(default="cambiar-esta-clave-de-al-menos-32-caracteres", min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False

    @property
    def cors_origins(self) -> list[str]:
        """Permite varios orígenes separados por coma (por ejemplo localhost y 127.0.0.1)."""
        return [origen.strip() for origen in self.FRONTEND_ORIGIN.split(",") if origen.strip()]


settings = Settings()
