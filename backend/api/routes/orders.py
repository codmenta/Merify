from fastapi import APIRouter, Depends, status
from models.order import OrderCreate, Order
from core.security import get_current_user
from models.user import User as UserModel
from db.json_handler import load_orders, save_orders

router = APIRouter()

@router.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_new_order(order_data: OrderCreate, current_user: UserModel = Depends(get_current_user)):
    orders = load_orders()
    
    new_order = Order(
        cliente_email=current_user.email,
        items=order_data.items,
        total=order_data.total
    )

    orders.append(new_order.dict())
    save_orders(orders)
    
    return new_order