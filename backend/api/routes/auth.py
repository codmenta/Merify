from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from core.security import create_access_token
from db.json_handler import load_users, save_users
from core.security import get_password_hash, verify_password
from models.user import User, UserCreate
from models.token import Token
from typing import Literal
from datetime import timedelta
from jose import JWTError, jwt
from core.config import settings

router = APIRouter()

# Modelo extendido para devolver el usuario completo en el registro
from pydantic import BaseModel

class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: User

@router.post("/register", response_model=TokenWithUser, status_code=status.HTTP_201_CREATED)
def register_user(form_data: UserCreate):
    """Registra un nuevo usuario y devuelve el token + datos del usuario."""
    users = load_users()
    email = form_data.email.lower().strip()
    
    if email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado.",
        )

    # Preparamos los datos del nuevo usuario para la base de datos
    user_to_save = {
        "nombre": form_data.nombre,
        "email": email,
        "tipo": form_data.tipo,
        "hashed_password": get_password_hash(form_data.password)
    }

    # Guardamos en el archivo JSON
    users[email] = user_to_save
    save_users(users)

    # Crear token de acceso
    access_token = create_access_token(data={"sub": email})
    
    # Preparamos los datos del usuario para la respuesta (SIN la contraseña)
    # Reutilizamos el modelo `User` que no tiene el campo de la contraseña.
    user_for_response = User(
        nombre=form_data.nombre,
        email=email,
        tipo=form_data.tipo
    )
    
    # Devolvemos la respuesta correcta
    return TokenWithUser(
        access_token=access_token,
        token_type="bearer",
        user=user_for_response
    )


@router.post("/login", response_model=TokenWithUser)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Inicia sesión y devuelve el token + datos del usuario."""
    users = load_users()
    user_data = users.get(form_data.username.lower())

    if not user_data or not verify_password(form_data.password, user_data.get("hashed_password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user_data["email"]})
    
    # Devolver token + datos del usuario
    user_response = User(**user_data)
    
    return TokenWithUser(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/forgot")
def forgot_password(payload: dict):
    """Simula el envío de un correo con un token de reseteo.

    Si el email existe, devuelve un token de reseteo (simulación).
    """
    email = (payload.get("email") or "").lower().strip()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email requerido")

    users = load_users()
    if email not in users:
        # No revelamos si el email existe; devolvemos mensaje de éxito
        return {"msg": "Si el email existe, recibirás instrucciones para resetear tu contraseña."}

    # Crear token de reseteo con expiración corta
    reset_token = create_access_token(
        data={"sub": email, "scope": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )

    # En una app real, aquí enviaríamos el token por correo. Para la simulación
    # devolvemos el token en la respuesta para que el frontend lo muestre.
    return {
        "msg": "Token de reseteo generado (simulado).",
        "reset_token": reset_token
    }


@router.post("/reset")
def reset_password(payload: dict):
    """Recibe token y nueva contraseña y actualiza el usuario si el token es válido."""
    token = payload.get("token")
    new_password = payload.get("new_password")

    if not token or not new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token y nueva contraseña son requeridos")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    email = payload.get("sub")
    scope = payload.get("scope")
    if scope != "password_reset" or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido para reseteo")

    users = load_users()
    user = users.get(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Actualizar contraseña
    users[email]["hashed_password"] = get_password_hash(new_password)
    save_users(users)

    return {"msg": "Contraseña actualizada correctamente."}