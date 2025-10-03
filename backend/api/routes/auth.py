from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from core.security import create_access_token
from db.json_handler import load_users, save_users
from core.security import get_password_hash, verify_password
from models.user import User, UserCreate
from models.token import Token

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

    hashed_password = get_password_hash(form_data.password)
    new_user = User(
        nombre=form_data.nombre,
        email=email,
        tipo=form_data.tipo
    ).dict()
    new_user["hashed_password"] = hashed_password

    users[email] = new_user
    save_users(users)

    # Crear token de acceso
    access_token = create_access_token(data={"sub": email})
    
    # Devolver token + datos del usuario (sin la contraseña)
    user_response = User(**new_user)
    
    return TokenWithUser(
        access_token=access_token,
        token_type="bearer",
        user=user_response
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