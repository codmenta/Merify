import stripe
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any # <-- Añadir Any
from core.config import settings
from core.security import get_current_user
from models.user import User

stripe.api_key = settings.STRIPE_SECRET_KEY
router = APIRouter()

# Definimos un modelo más explícito para los items
class LineItem(BaseModel):
    price_data: Dict[str, Any]
    quantity: int

class CheckoutSessionRequest(BaseModel):
    line_items: List[LineItem]
    customer_email: str

# RUTA CORREGIDA: Sin /payments
# EN backend/api/routes/payments.py

@router.get("/config")
def get_payment_config():
    # ¡CORRECTO! Debe devolver la clave publicable
    return {"publishableKey": settings.STRIPE_PUBLISHABLE_KEY}

# RUTA CORREGIDA: Sin /payments
@router.post("/create-checkout-session")
def create_checkout_session(request: CheckoutSessionRequest, current_user: User = Depends(get_current_user)):
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=request.dict()["line_items"], # Usamos el request completo
            customer_email=request.customer_email,
            mode='payment',
            success_url='http://localhost:5174/order/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:5174/cart',
        )
        return {"sessionId": checkout_session.id}
    except Exception as e:
        # Imprime el error en el terminal para más detalles de depuración
        print(f"Error creating Stripe session: {e}") 
        raise HTTPException(status_code=500, detail=str(e))