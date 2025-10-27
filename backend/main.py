# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, products, users, orders, cart, payments, admin, vendor
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# ==========================================
# CONFIGURACIÓN DE CORS
# ==========================================
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS_STR.split(',')]

# Agregar localhost para desarrollo
if 'localhost' not in str(origins):
    origins.extend([
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ROUTERS - ORDEN IMPORTA PARA PRECEDENCIA
# ==========================================

# 1. Autenticación
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# 2. Usuarios
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# 3. Productos
app.include_router(products.router, prefix="/api", tags=["Products"])

# 4. Carrito
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])

# 5. Órdenes
app.include_router(orders.router, prefix="/api", tags=["Orders"])

# 6. Pagos
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

# 7. Panel de Administrador (requiere autenticación + rol admin)
app.include_router(admin.router, tags=["Admin"])

# 8. Panel de Vendedor (requiere autenticación + rol vendor)
app.include_router(vendor.router, tags=["Vendor"])

# ==========================================
# ENDPOINTS DE SALUD
# ==========================================

@app.get("/")
def root():
    """Endpoint raíz - muestra info de la API"""
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "products": "/api/products",
            "cart": "/api/cart",
            "orders": "/api/orders",
            "payments": "/api/payments",
            "admin": "/api/admin",
            "vendor": "/api/vendor"
        }
    }

@app.get("/api/health")
def health_check():
    """Verifica que la API esté funcionando"""
    return {
        "status": "ok",
        "message": "API funcionando correctamente"
    }

# ==========================================
# MANEJO DE ERRORES GLOBAL (OPCIONAL)
# ==========================================

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura errores no manejados"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error": str(exc)
        }
    )