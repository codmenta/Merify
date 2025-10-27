# backend/models/user.py
from pydantic import BaseModel
from typing import Optional, Literal

class User(BaseModel):
    nombre: str
    email: str
    tipo: str = "cliente"
    role: Literal["customer", "vendor", "admin"] = "customer"  # ← NUEVO

class UserInDB(User):
    hashed_password: str

class UserCreate(User):
    password: str

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    tipo: Optional[str] = None
    role: Optional[Literal["customer", "vendor", "admin"]] = None
    password: Optional[str] = None

