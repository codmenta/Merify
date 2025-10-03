from fastapi import APIRouter, Depends, status
from models.order import OrderCreate, Order
from core.security import get_current_user
from models.user import User as UserModel
from db.json_handler import load_orders, save_orders

router = APIRouter()

@router.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_new_order(order_data: OrderCreate, current_user: UserModel = Depends(get_current_user)):
    orders = load_orders()
    
    # --- FIX CLAVE AQUÍ ---
    # Verificamos si 'orders' es una lista. Si no lo es (porque el JSON es {}),
    # la convertimos en una lista vacía para que .append() funcione.
    if not isinstance(orders, list):
        orders = []

    # Creamos la nueva orden. Tu modelo en `order.py` ya se encarga de
    # generar el id, la fecha y el estado automáticamente. ¡Muy bien hecho!
    new_order = Order(
        cliente_email=current_user.email,
        items=order_data.items,
        total=order_data.total
    )

    # Ahora 'orders' es garantizadamente una lista, por lo que .append() funcionará.
    orders.append(new_order.dict())
    save_orders(orders) # Guardamos la lista completa de nuevo en el JSON.
    
    return new_order