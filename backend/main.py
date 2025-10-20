from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, products, users, orders, cart, payments
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS_STR.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(cart.router, prefix="/api", tags=["Cart"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}