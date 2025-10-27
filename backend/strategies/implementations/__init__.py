# backend/strategies/implementations/__init__.py
"""
Implementaciones concretas de pasarelas de pago
"""

from .stripe_gateway import StripeGateway
from .paypal_gateway import PayPalGateway

__all__ = ['StripeGateway', 'PayPalGateway']