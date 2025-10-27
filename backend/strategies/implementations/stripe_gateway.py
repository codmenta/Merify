import stripe
from typing import Dict, Any, List
from strategies.payment_gateway import PaymentGateway
from core.config import settings

class StripeGateway(PaymentGateway):
    """Implementación concreta para Stripe"""
    
    def __init__(self):
        super().__init__("Stripe")
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.available = bool(settings.STRIPE_SECRET_KEY)
    
    async def create_payment_session(
        self,
        line_items: List[Dict[str, Any]],
        customer_email: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """Crea una sesión de checkout de Stripe"""
        try:
            session = stripe.checkout.Session.create(
                line_items=line_items,
                customer_email=customer_email,
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
            )
            
            return {
                "gateway": "stripe",
                "sessionId": session.id,
                "url": session.url,
                "status": "created"
            }
        except Exception as e:
            raise ValueError(f"Error en Stripe: {str(e)}")
    
    async def verify_transaction(self, session_id: str) -> Dict[str, Any]:
        """Verifica una sesión de Stripe"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return {
                "gateway": "stripe",
                "sessionId": session_id,
                "status": session.payment_status,
                "amount": session.amount_total,
                "currency": session.currency
            }
        except Exception as e:
            raise ValueError(f"Error verificando transacción: {str(e)}")