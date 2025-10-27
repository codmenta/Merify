from abc import ABC, abstractmethod
from typing import Dict, Any, List

class PaymentGateway(ABC):
    """
    Interfaz abstracta (Strategy) que define el contrato común
    para todas las pasarelas de pago.
    """
    
    def __init__(self, name: str):
        self.name = name
        self.available = False
    
    @abstractmethod
    async def create_payment_session(
        self, 
        line_items: List[Dict[str, Any]], 
        customer_email: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Crea una sesión de pago.
        
        Returns:
            {
                "gateway": "stripe",
                "sessionId": "cs_test_...",
                "url": "https://checkout.stripe.com/..."
            }
        """
        pass
    
    @abstractmethod
    async def verify_transaction(self, session_id: str) -> Dict[str, Any]:
        """Verifica el estado de una transacción"""
        pass
    
    def is_available(self) -> bool:
        """Retorna si la pasarela está disponible"""
        return self.available