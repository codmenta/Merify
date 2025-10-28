from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Any, Literal

from services.payment_service import PaymentService, get_payment_service
from core.config import settings
from core.security import get_current_user
from models.user import User

router = APIRouter()

class LineItem(BaseModel):
    price_data: Dict[str, Any]
    quantity: int

class CheckoutSessionRequest(BaseModel):
    line_items: List[LineItem]
    gateway: Literal["stripe", "paypal"]  # Validación automática


class RefundSimulateRequest(BaseModel):
    gateway: Literal["stripe", "paypal"]
    session_id: str
    amount: int = None  # en la unidad mínima (centavos), opcional

@router.get("/config")
def get_payment_config():
    """Devuelve las claves publicables para configurar el frontend"""
    # Evitar exponer accidentalmente la clave secreta si fue colocada por error
    publishable = settings.STRIPE_PUBLISHABLE_KEY or ""
    if publishable.startswith("sk_"):
        # Registro simple en el servidor para facilitar depuración local.
        print("WARNING: STRIPE_PUBLISHABLE_KEY parece ser una clave secreta (empieza por sk_). No la expondremos al frontend.")
        publishable = ""

    return {
        "stripe": {
            "publishableKey": publishable
        },
        "paypal": {
            "clientId": settings.PAYPAL_CLIENT_ID
        }
    }

@router.get("/gateways")
def get_available_gateways(
    payment_service: PaymentService = Depends(get_payment_service)
):
    """Lista las pasarelas de pago disponibles"""
    return {
        "success": True,
        "gateways": payment_service.get_available_gateways()
    }

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service)
):
    """
    Crea una sesión de pago usando la pasarela especificada.
    Este endpoint es AGNÓSTICO a la pasarela de pago.
    """
    if not request.line_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito no puede estar vacío"
        )
    
    try:
        # Delegar toda la lógica al servicio
        result = await payment_service.process_checkout(
            gateway_name=request.gateway,
            line_items=[item.dict() for item in request.line_items],
            customer_email=current_user.email
        )
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error en checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando el pago: {str(e)}"
        )

@router.get("/verify/{gateway}/{session_id}")
async def verify_transaction(
    gateway: str,
    session_id: str,
    payment_service: PaymentService = Depends(get_payment_service)
):
    """Verifica el estado de una transacción"""
    try:
        result = await payment_service.verify_payment(gateway, session_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post('/refund-simulate')
def simulate_refund(
    request: RefundSimulateRequest,
    current_user: User = Depends(get_current_user)
):
    """Simula una devolución sin contactar a la pasarela.

    Útil para pruebas locales y para reducir errores en flujos de desarrollo.
    Retorna un objeto de devolución simulado.
    """
    # Validaciones simples
    if not request.session_id or not isinstance(request.session_id, str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session_id inválido")
    if request.amount is not None and request.amount < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="amount inválido")

    # Construir respuesta simulada
    simulated_refund = {
        "gateway": request.gateway,
        "refund_id": f"sim_{request.session_id[:8]}",
        "status": "succeeded",
        "amount": request.amount or 0,
        "currency": "COP",
        "simulated": True,
        "message": "Esta es una devolución simulada. No se realizó ninguna operación en la pasarela."
    }

    return {"success": True, "refund": simulated_refund}
