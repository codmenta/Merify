from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class Product(BaseModel):
    id: int
    nombre: str
    precio: float
    categoria: str
    marca: str
    descripcion: str

class OrderItem(BaseModel):
    id: int
    nombre: str
    cantidad: int
    precio_final: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float

class Order(BaseModel):
    id: str = str(uuid.uuid4())
    fecha: str = datetime.now().isoformat()
    cliente_email: str
    items: List[OrderItem]
    total: float
    estado: str = "Completado"