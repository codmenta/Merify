# backend/api/routes/admin.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from core.security import get_current_admin_user
from models.user import User

router = APIRouter(
    prefix="/api/admin",  # 🔥 CAMBIADO: Agregamos /api al prefijo
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)]
)

# --- Modelos Pydantic ---
class ProductUpdate(BaseModel):
    status: str

class UserUpdate(BaseModel):
    status: str

class PlatformConfig(BaseModel):
    discount: float
    shipping_policy: str

# --- PRODUCTOS ---
@router.get("/products")
async def get_all_products():
    from db.json_handler import read_json
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        return {"products": products}
    except Exception as e:
        print(f"Error loading products: {e}")
        return {"products": []}

@router.patch("/products/{product_id}")
async def update_product_status(product_id: int, update: ProductUpdate):
    from db.json_handler import read_json, write_json
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        product = next((p for p in products if p.get("id") == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        product["status"] = update.status
        data["productos"] = products
        write_json("productos.json", data)
        
        return {"message": "Producto actualizado", "product": product}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    from db.json_handler import read_json, write_json
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        original_length = len(products)
        products = [p for p in products if p.get("id") != product_id]
        
        if len(products) == original_length:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        data["productos"] = products
        write_json("productos.json", data)
        
        return {"message": "Producto eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# --- USUARIOS ---
@router.get("/users")
async def get_all_users():
    from db.json_handler import read_json
    try:
        users_dict = read_json("users.json")
        users_list = [
            {**user, "status": user.get("status", "active")} 
            for user in users_dict.values()
        ]
        # Remover contraseñas
        safe_users = [
            {k: v for k, v in user.items() if k != "hashed_password"} 
            for user in users_list
        ]
        return {"users": safe_users}
    except Exception as e:
        print(f"Error loading users: {e}")
        return {"users": []}

@router.patch("/users/{user_email}")
async def update_user_status(user_email: str, update: UserUpdate):
    from db.json_handler import read_json, write_json
    try:
        users = read_json("users.json")
        
        if user_email not in users:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        users[user_email]["status"] = update.status
        write_json("users.json", users)
        
        return {"message": "Usuario actualizado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/users/{user_email}")
async def delete_user(user_email: str):
    from db.json_handler import read_json, write_json
    try:
        users = read_json("users.json")
        
        if user_email not in users:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        del users[user_email]
        write_json("users.json", users)
        
        return {"message": "Usuario eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# --- PAGOS ---
@router.get("/payments")
async def get_payment_history():
    from db.json_handler import read_json
    try:
        orders = read_json("orders.json")
        return {"payments": orders}
    except Exception as e:
        print(f"Error loading payments: {e}")
        return {"payments": []}

# --- CONFIGURACIÓN ---
@router.get("/config")
async def get_platform_config():
    from db.json_handler import read_json
    try:
        config = read_json("platform_config.json")
        return config
    except:
        return {"discount": 0, "shipping_policy": ""}

@router.post("/config")
async def update_platform_config(config: PlatformConfig):
    from db.json_handler import write_json
    try:
        write_json("platform_config.json", config.dict())
        return {"message": "Configuración actualizada", "config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")