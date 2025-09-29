from fastapi import APIRouter, Depends
from models.user import User
from core.security import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Obtiene el perfil del usuario actualmente autenticado."""
    return current_user