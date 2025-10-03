from pydantic import BaseModel
from typing import List

class CartItem(BaseModel):
    id: int
    producto_id: int
    nombre: str
    precio: float
    cantidad: int
    imagen: str = ""

class CartItemCreate(BaseModel):
    producto_id: int
    cantidad: int = 1

class CartItemUpdate(BaseModel):
    cantidad: int

class CartResponse(BaseModel):
    items: List[CartItem]
    total: float

class Cart(BaseModel):
    items: List[CartItem]
    total: float = 0.0
    def calcular_total(self):
        self.total = sum(item.precio * item.cantidad for item in self.items)
        return self.total
    def agregar_item(self, item: CartItem):
        for existing_item in self.items:
            if existing_item.producto_id == item.producto_id:
                existing_item.cantidad += item.cantidad
                self.calcular_total()
                return
        self.items.append(item)
        self.calcular_total()       
    def actualizar_item(self, producto_id: int, cantidad: int):
        for existing_item in self.items:
            if existing_item.producto_id == producto_id:
                existing_item.cantidad = cantidad
                self.calcular_total()
                return
    def eliminar_item(self, producto_id: int):
        self.items = [item for item in self.items if item.producto_id != producto_id]
        self.calcular_total()
    def vaciar_carrito(self):
        self.items = []
        self.total = 0.0
        return self.total