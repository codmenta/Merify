# backend/api/routes/vendor.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from core.security import get_current_user
from models.user import User
from db.json_handler import read_json, write_json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from core.security import get_current_use
router = APIRouter(prefix="/api/vendor", tags=["vendor"])

# ==========================================
# MODELOS PYDANTIC
# ==========================================

class ProductCreate(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    marca: str
    stock: int = 0
    imagen: str = ""
    destacado: bool = False

class ProductUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    categoria: Optional[str] = None
    marca: Optional[str] = None
    stock: Optional[int] = None
    imagen: Optional[str] = None
    destacado: Optional[bool] = None

class OrderStatusUpdate(BaseModel):
    status: str

# ==========================================
# MIDDLEWARE DE AUTENTICACIÓN
# ==========================================

def get_current_vendor_user(current_user: User = Depends(get_current_user)):
    """Verifica que el usuario actual sea 'vendor' o 'admin'."""
    # Los administradores también pueden actuar como vendedores
    if current_user.role not in ["vendor", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requieren permisos de vendedor o administrador."
        )
    return current_user

router = APIRouter(
    prefix="/vendor", # El prefijo /api se define en main.py
    tags=["Vendor"],
    dependencies=[Depends(get_current_vendor_user)] # <-- Protege todo el router
)

# ==========================================
# ENDPOINTS DE PRODUCTOS
# ==========================================

@router.get("/products")
def get_my_products(current_user: User = Depends(get_current_vendor_user)):
    """Obtiene todos los productos del vendedor autenticado"""
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        # Filtrar solo los productos de este vendedor
        my_products = [
            p for p in products 
            if p.get("vendor_id") == current_user.email
        ]
        
        return {"products": my_products, "total": len(my_products)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar productos: {str(e)}")


@router.post("/products", status_code=201)

def create_product(product: ProductCreate, current_user: User = Depends(get_current_vendor_user)):
    """Crea un nuevo producto (requiere aprobación del admin)"""
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        # Generar ID único
        new_id = max([p.get("id", 0) for p in products], default=0) + 1
        
        # Crear el nuevo producto
        new_product = {
            "id": new_id,
            "nombre": product.nombre,
            "descripcion": product.descripcion,
            "precio": product.precio,
            "categoria": product.categoria,
            "marca": product.marca,
            "stock": product.stock,
            "imagen": product.imagen,
            "destacado": product.destacado,
            "vendor_id": current_user.email,
            "vendor_name": current_user.nombre,
            "status": "pending",  # Requiere aprobación
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        products.append(new_product)
        data["productos"] = products
        write_json("productos.json", data)
        
        return {
            "message": "Producto creado exitosamente (pendiente de aprobación)",
            "product": new_product
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {str(e)}")


@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(verify_vendor)
):
    """Actualiza un producto propio del vendedor"""
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        # Buscar el producto
        product = next((p for p in products if p["id"] == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Verificar que el producto pertenece al vendedor
        if product.get("vendor_id") != current_user.email:
            raise HTTPException(
                status_code=403, 
                detail="No tienes permiso para editar este producto"
            )
        
        # Actualizar solo los campos proporcionados
        update_data = product_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            product[key] = value
        
        product["updated_at"] = datetime.now().isoformat()
        
        data["productos"] = products
        write_json("productos.json", data)
        
        return {"message": "Producto actualizado", "product": product}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {str(e)}")


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(verify_vendor)
):
    """Elimina un producto propio del vendedor"""
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        # Buscar el producto
        product = next((p for p in products if p["id"] == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Verificar que el producto pertenece al vendedor
        if product.get("vendor_id") != current_user.email:
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para eliminar este producto"
            )
        
        # Eliminar el producto
        products = [p for p in products if p["id"] != product_id]
        data["productos"] = products
        write_json("productos.json", data)
        
        return {"message": "Producto eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")


# ==========================================
# ENDPOINTS DE ÓRDENES
# ==========================================

@router.get("/orders")
def get_my_orders(current_user: User = Depends(verify_vendor)):
    """Obtiene las órdenes que contienen productos del vendedor"""
    try:
        orders = read_json("orders.json")
        data = read_json("productos.json")
        products = data.get("productos", [])
        
        # IDs de productos del vendedor
        my_product_ids = [
            p["id"] for p in products 
            if p.get("vendor_id") == current_user.email
        ]
        
        # Filtrar órdenes que contienen productos del vendedor
        my_orders = []
        for order in orders:
            vendor_items = [
                item for item in order.get("items", [])
                if item.get("id") in my_product_ids
            ]
            
            if vendor_items:
                my_orders.append({
                    **order,
                    "items": vendor_items
                })
        
        return {"orders": my_orders, "total": len(my_orders)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar órdenes: {str(e)}")


@router.patch("/orders/{order_id}")
def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    current_user: User = Depends(verify_vendor)
):
    """Actualiza el estado de una orden (ej: marcar como enviado)"""
    try:
        orders = read_json("orders.json")
        
        # Buscar la orden
        order = next((o for o in orders if o.get("id") == order_id), None)
        if not order:
            raise HTTPException(status_code=404, detail="Orden no encontrada")
        
        # Actualizar estado
        order["estado"] = update.status
        order["updated_at"] = datetime.now().isoformat()
        
        write_json("orders.json", orders)
        
        return {"message": "Orden actualizada", "order": order}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar orden: {str(e)}")


# ==========================================
# ESTADÍSTICAS DEL VENDEDOR
# ==========================================

@router.get("/stats")
def get_vendor_stats(current_user: User = Depends(verify_vendor)):
    """Obtiene estadísticas de ventas del vendedor"""
    try:
        data = read_json("productos.json")
        products = data.get("productos", [])
        orders = read_json("orders.json")
        
        # Productos del vendedor
        my_products = [
            p for p in products 
            if p.get("vendor_id") == current_user.email
        ]
        
        my_product_ids = [p["id"] for p in my_products]
        
        # Calcular estadísticas
        total_sales = 0
        total_orders = 0
        
        for order in orders:
            for item in order.get("items", []):
                if item.get("id") in my_product_ids:
                    total_sales += item.get("precio_final", 0) * item.get("cantidad", 1)
                    total_orders += 1
        
        return {
            "total_products": len(my_products),
            "active_products": len([p for p in my_products if p.get("status") == "active"]),
            "pending_products": len([p for p in my_products if p.get("status") == "pending"]),
            "total_orders": total_orders,
            "total_sales": total_sales,
            "vendor_name": current_user.nombre,
            "vendor_email": current_user.email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar estadísticas: {str(e)}")