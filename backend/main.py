from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, products, users, orders
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Dividimos el string por comas para crear la lista
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS_STR.split(',')]
 app.add_middleware(
     CORSMiddleware,
     allow_origins=origins,
     allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
 )

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])


@app.get("/api/health")
def health_check():
    """Endpoint de verificación para saber si la API está funcionando."""
    return {"status": "ok"}
