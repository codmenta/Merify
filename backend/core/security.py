# backend/core/security.py (CORREGIDO Y COMPLETO)

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from core.config import settings
from models.user import User
from models.token import TokenData
from db.json_handler import load_users

# --- Hashing de Contraseña ---
# Usar "sha256_crypt" es correcto para evitar el límite de 72 bytes de bcrypt.
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)


# --- Creación de Token JWT ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un nuevo token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# --- Dependencias de Seguridad para Rutas ---
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependencia que decodifica el token para obtener el usuario actual.
    Lanza una excepción 401 si el token es inválido o el usuario no existe.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    users = load_users()
    # load_users devuelve un diccionario de diccionarios, no una lista.
    # Así que necesitamos encontrar el usuario por su email.
    user_data = None
    for user_record in users.values():
        if user_record['email'] == token_data.email:
            user_data = user_record
            break

    if user_data is None:
        raise credentials_exception
        
    return User(**user_data)


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia que verifica que el usuario actual tiene el rol de 'admin'.
    Lanza una excepción 403 si no tiene permisos.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos de administrador para realizar esta acción"
        )
    return current_user