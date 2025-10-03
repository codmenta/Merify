import json
from pathlib import Path
from typing import Dict, List, Any

# Ajusta la ruta base para que apunte al directorio 'db'
BASE_DIR = Path(__file__).resolve().parent
PRODUCTS_FILE = BASE_DIR / "productos.json"
USERS_FILE = BASE_DIR / "users.json"
ORDERS_FILE = BASE_DIR / "orders.json"
CART_FILE = BASE_DIR / "carts.json"  # NUEVO: Archivo para carritos

def _load_data(file_path: Path, default: Any) -> Any:
    if not file_path.exists():
        # Crea el archivo si no existe con el valor por defecto
        _save_data(file_path, default)
        return default
    try:
        return json.loads(file_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return default

def _save_data(file_path: Path, data: Any):
    file_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')

def load_products() -> List[Dict[str, Any]]:
    data = _load_data(PRODUCTS_FILE, {"productos": []})
    return data.get("productos", [])

def load_users() -> Dict[str, Any]:
    return _load_data(USERS_FILE, {})

def save_users(users: Dict[str, Any]):
    _save_data(USERS_FILE, users)

def load_orders() -> List[Dict[str, Any]]:
    return _load_data(ORDERS_FILE, [])

def save_orders(orders: List[Dict[str, Any]]):
    _save_data(ORDERS_FILE, orders)

# ========== FUNCIONES DE CARRITO (NUEVAS) ==========
def load_carts() -> Dict[str, List[Dict[str, Any]]]:
    """
    Carga los carritos de todos los usuarios.
    Estructura: { "email_usuario": [ {item1}, {item2}, ... ], ... }
    """
    return _load_data(CART_FILE, {})

def save_carts(carts: Dict[str, List[Dict[str, Any]]]):
    """Guarda todos los carritos."""
    _save_data(CART_FILE, carts)

def get_user_cart(email: str) -> List[Dict[str, Any]]:
    """Obtiene el carrito de un usuario específico."""
    carts = load_carts()
    return carts.get(email, [])

def save_user_cart(email: str, cart_items: List[Dict[str, Any]]):
    """Guarda el carrito de un usuario específico."""
    carts = load_carts()
    carts[email] = cart_items
    save_carts(carts)

def clear_user_cart(email: str):
    """Vacía el carrito de un usuario."""
    carts = load_carts()
    carts[email] = []
    save_carts(carts)