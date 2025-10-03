from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str
    ALLOWED_ORIGINS_STR: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
