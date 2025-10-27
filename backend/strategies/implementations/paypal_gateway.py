import uuid
from typing import Dict, Any, List
from strategies.payment_gateway import PaymentGateway
from core.config import settings

class PayPalGateway(PaymentGateway):
    """
    Implementación para PayPal.
    NOTA: Esta es una versión simulada. Para producción necesitas el SDK oficial:
    pip install paypalrestsdk
    """
    
    def __init__(self):
        super().__init__("PayPal")
        # En producción, inicializarías el cliente de PayPal aquí
        self.available = bool(
            settings.PAYPAL_CLIENT_ID and 
            settings.PAYPAL_CLIENT_SECRET
        )
    
    async def create_payment_session(
        self,
        line_items: List[Dict[str, Any]],
        customer_email: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """Simula la creación de una orden en PayPal"""
        
        # Calcular total
        total = sum(
            item['price_data']['unit_amount'] * item['quantity'] 
            for item in line_items
        ) / 100
        
        # Generar ID simulado
        order_id = f"PAYPAL-{uuid.uuid4()}"
        
        print(f"[PayPal Simulado] Orden {order_id} creada para {customer_email} - Total: ${total:.2f}")
        
        return {
            "gateway": "paypal",
            "orderId": order_id,
            "url": f"https://www.sandbox.paypal.com/checkoutnow?token={order_id}",
            "status": "created"
        }
    
    async def verify_transaction(self, session_id: str) -> Dict[str, Any]:
        """Simula la verificación de una orden PayPal"""
        return {
            "gateway": "paypal",
            "orderId": session_id,
            "status": "COMPLETED",
            "message": "Simulación: transacción aprobada"
        }