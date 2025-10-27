# backend/strategies/__init__.py
"""
Módulo de estrategias de pago (Strategy Pattern)
"""

from .payment_gateway import PaymentGateway

__all__ = ['PaymentGateway']