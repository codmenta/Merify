from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, products, users, orders, cart  # AGREGAR cart
from core.config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# Parsear los orígenes permitidos desde la configuración
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS_STR.split(',') if origin.strip()]

# Si no hay orígenes configurados, usar valores por defecto (solo desarrollo)
if not origins:
    origins = ["http://localhost:3000", "http://localhost:5173"]

# LOG IMPORTANTE: Ver qué orígenes se están permitiendo
logger.info(f"🔥 CORS Origins configurados: {origins}")
logger.info(f"🔥 ALLOWED_ORIGINS_STR: {settings.ALLOWED_ORIGINS_STR}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(cart.router, prefix="/api", tags=["Cart"])  # NUEVO: Router del carrito

@app.get("/api/health")
def health_check():
    """Endpoint de verificación para saber si la API está funcionando."""
    return {"status": "ok"}

@app.get("/api/debug/cors")
def debug_cors():
    """Endpoint para verificar la configuración de CORS"""
    return {
        "allowed_origins": origins,
        "origins_str": settings.ALLOWED_ORIGINS_STR,
        "origins_count": len(origins)
    }
