# backend/api/routes/admin.py (CORREGIDO Y LIMPIO)

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from core.security import get_current_admin_user
from models.user import User

router = APIRouter(
    prefix="/admin", 
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)]
)

# --- Modelos Pydantic (sin cambios) ---
class ProductUpdate(BaseModel):
    status: str

class UserUpdate(BaseModel):
    status: str

class PlatformConfig(BaseModel):
    discount: float
    shipping_policy: str

# --- Endpoints (Ahora sin la dependencia individual) ---

# PRODUCTOS
@router.get("/products")
async def get_all_products():
    from db.json_handler import read_json
    products = read_json("productos.json")
    return {"products": products}

@router.patch("/products/{product_id}")
async def update_product_status(product_id: int, update: ProductUpdate):
    from db.json_handler import read_json, write_json
    products = read_json("productos.json")
    product = next((p for p in products if p.get("id") == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product["status"] = update.status
    write_json("productos.json", products)
    return {"message": "Producto actualizado", "product": product}

@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    from db.json_handler import read_json, write_json
    products = read_json("productos.json")
    products = [p for p in products if p.get("id") != product_id]
    write_json("productos.json", products)
    return {"message": "Producto eliminado"}

# USUARIOS
@router.get("/users")
async def get_all_users():
    from db.json_handler import read_json
    users_dict = read_json("users.json")
    # Asegúrate de que estás manejando la estructura de diccionario
    users_list = list(users_dict.values())
    safe_users = [{k: v for k, v in user.items() if k != "hashed_password"} for user in users_list]
    return {"users": safe_users}

@router.patch("/users/{user_id}")
async def update_user_status(user_id: int, update: UserUpdate):
    # La lógica para actualizar usuarios necesita adaptarse a tu estructura de users.json
    raise HTTPException(status_code=501, detail="Funcionalidad no implementada para la estructura actual de users.json")

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    raise HTTPException(status_code=501, detail="Funcionalidad no implementada para la estructura actual de users.json")

# PAGOS
@router.get("/payments")
async def get_payment_history():
    from db.json_handler import read_json
    orders = read_json("orders.json")
    return {"payments": orders}

# CONFIGURACIÓN
@router.get("/config")
async def get_platform_config():
    from db.json_handler import read_json
    try:
        config = read_json("platform_config.json")
    except:
        config = {"discount": 0, "shipping_policy": ""}
    return config

@router.post("/config")
async def update_platform_config(config: PlatformConfig):
    from db.json_handler import write_json
    write_json("platform_config.json", config.dict())
    return {"message": "Configuración actualizada", "config": config}