from typing import Dict, Any, List
from strategies.payment_gateway import PaymentGateway
from strategies.implementations.stripe_gateway import StripeGateway
from strategies.implementations.paypal_gateway import PayPalGateway

class PaymentService:
    """
    Contexto que utiliza las estrategias de pago.
    NO conoce los detalles de ninguna pasarela, solo la interfaz.
    """
    
    def __init__(self):
        self._gateways: Dict[str, PaymentGateway] = {}
        self._register_gateways()
    
    def _register_gateways(self):
        """Registra todas las pasarelas disponibles"""
        # Stripe
        try:
            stripe_gateway = StripeGateway()
            if stripe_gateway.is_available():
                self._gateways["stripe"] = stripe_gateway
                print("✅ Stripe Gateway registrado")
        except Exception as e:
            print(f"⚠️  Stripe no disponible: {e}")
        
        # PayPal
        try:
            paypal_gateway = PayPalGateway()
            if paypal_gateway.is_available():
                self._gateways["paypal"] = paypal_gateway
                print("✅ PayPal Gateway registrado")
        except Exception as e:
            print(f"⚠️  PayPal no disponible: {e}")
    
    def get_available_gateways(self) -> List[str]:
        """Retorna lista de pasarelas disponibles"""
        return list(self._gateways.keys())
    
    def _get_gateway(self, gateway_name: str) -> PaymentGateway:
        """Obtiene una pasarela por nombre"""
        gateway = self._gateways.get(gateway_name.lower())
        if not gateway:
            available = ", ".join(self._gateways.keys())
            raise ValueError(
                f"Pasarela '{gateway_name}' no soportada. "
                f"Disponibles: {available}"
            )
        return gateway
    
    async def process_checkout(
        self,
        gateway_name: str,
        line_items: List[Dict[str, Any]],
        customer_email: str,
        success_url: str = "http://localhost:5174/order/success",
        cancel_url: str = "http://localhost:5174/cart"
    ) -> Dict[str, Any]:
        """
        Procesa un checkout usando la pasarela especificada.
        Este método es agnóstico a la pasarela.
        """
        gateway = self._get_gateway(gateway_name)
        return await gateway.create_payment_session(
            line_items=line_items,
            customer_email=customer_email,
            success_url=success_url,
            cancel_url=cancel_url
        )
    
    async def verify_payment(
        self,
        gateway_name: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Verifica un pago en la pasarela especificada"""
        gateway = self._get_gateway(gateway_name)
        return await gateway.verify_transaction(session_id)

# Instancia singleton
payment_service = PaymentService()

def get_payment_service() -> PaymentService:
    """Dependency injection para FastAPI"""
    return payment_service