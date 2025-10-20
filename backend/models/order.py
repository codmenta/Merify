from pydantic import BaseModel
from typing import List
from pydantic import Field
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fecha: str = Field(default_factory=lambda: datetime.now().isoformat())
    cliente_email: str
    items: List[OrderItem]
    total: float
    estado: str = "Completado"