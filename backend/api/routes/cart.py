from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.cart import CartItem, CartItemCreate, CartItemUpdate, CartResponse
from models.user import User
from core.security import get_current_user
from db.json_handler import (
    get_user_cart, 
    save_user_cart, 
    clear_user_cart,
    load_products
)

router = APIRouter()

def _find_product_by_id(product_id: int):
    """Busca un producto por ID en la lista de productos."""
    productos = load_products()
    for producto in productos:
        if producto.get("id") == product_id:
            return producto
    return None

def _generate_cart_item_id(cart_items: List[dict]) -> int:
    """Genera un ID único para un item del carrito."""
    if not cart_items:
        return 1
    return max(item.get("id", 0) for item in cart_items) + 1

# ========================================
# ✅ RUTAS CORREGIDAS (sin /cart porque ya está en el prefijo)
# ========================================

# GET /api/cart (lista de items)
@router.get("", response_model=List[CartItem])
def get_cart(current_user: User = Depends(get_current_user)):
    """Obtiene el carrito del usuario actual."""
    cart_items = get_user_cart(current_user.email)
    return cart_items

# POST /api/cart (agregar producto)
@router.post("", response_model=CartItem, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Agrega un producto al carrito."""
    producto = _find_product_by_id(item_data.producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    cart_items = get_user_cart(current_user.email)
    
    # Buscar si el producto ya existe
    existing_item = None
    for item in cart_items:
        if item.get("producto_id") == item_data.producto_id:
            existing_item = item
            break
    
    if existing_item:
        # Actualizar cantidad
        existing_item["cantidad"] += item_data.cantidad
        save_user_cart(current_user.email, cart_items)
        return CartItem(**existing_item)
    
    # Crear nuevo item
    new_item = {
        "id": _generate_cart_item_id(cart_items),
        "producto_id": producto["id"],
        "nombre": producto["nombre"],
        "precio": producto["precio"],
        "cantidad": item_data.cantidad,
        "imagen": producto.get("imagen", "")
    }
    
    cart_items.append(new_item)
    save_user_cart(current_user.email, cart_items)
    
    return CartItem(**new_item)

# PUT /api/cart/{item_id} (actualizar cantidad)
@router.put("/{item_id}", response_model=CartItem)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """Actualiza la cantidad de un item del carrito."""
    cart_items = get_user_cart(current_user.email)
    
    item_to_update = None
    for item in cart_items:
        if item.get("id") == item_id:
            item_to_update = item
            break
    
    if not item_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito"
        )
    
    # Si la cantidad es 0 o negativa, eliminar el item
    if item_data.cantidad <= 0:
        cart_items = [item for item in cart_items if item.get("id") != item_id]
        save_user_cart(current_user.email, cart_items)
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Item eliminado del carrito"
        )
    
    # Actualizar cantidad
    item_to_update["cantidad"] = item_data.cantidad
    save_user_cart(current_user.email, cart_items)
    
    return CartItem(**item_to_update)

# DELETE /api/cart/{item_id} (eliminar item específico)
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    """Elimina un item del carrito."""
    cart_items = get_user_cart(current_user.email)
    
    original_length = len(cart_items)
    cart_items = [item for item in cart_items if item.get("id") != item_id]
    
    if len(cart_items) == original_length:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito"
        )
    
    save_user_cart(current_user.email, cart_items)
    return None

# DELETE /api/cart (vaciar carrito completo)
@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(current_user: User = Depends(get_current_user)):
    """Vacía el carrito del usuario."""
    clear_user_cart(current_user.email)
    return None

# GET /api/cart/summary (resumen con total)
@router.get("/summary", response_model=CartResponse)
def get_cart_summary(current_user: User = Depends(get_current_user)):
    """Obtiene el resumen del carrito con el total."""
    cart_items = get_user_cart(current_user.email)
    
    total = sum(
        item.get("precio", 0) * item.get("cantidad", 0) 
        for item in cart_items
    )
    
    return CartResponse(
        items=[CartItem(**item) for item in cart_items],
        total=total
    )