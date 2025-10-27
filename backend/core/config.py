from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str
    ALLOWED_ORIGINS_STR: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    
    # PayPal (NUEVO)
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_MODE: str = "sandbox"

    class Config:
        env_file = ".env"

settings = Settings()