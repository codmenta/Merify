from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    nombre: str
    email: str
    tipo: str = "cliente"

class UserInDB(User):
    hashed_password: str

class UserCreate(User):
    password: str