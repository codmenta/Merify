from fastapi import APIRouter, Depends, HTTPException, status
from models.user import User, UserUpdate
from core.security import get_current_user, get_password_hash, verify_password
from db.json_handler import load_users, save_users

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Obtiene el perfil del usuario actualmente autenticado."""
    return current_user

@router.put("/me", response_model=User)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Actualiza el perfil del usuario autenticado."""
    users = load_users()
    email = current_user.email
    
    if email not in users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = user_update.dict(exclude_unset=True)
    
    # Si se proporciona contraseña, hashearla antes de guardar
    if "password" in update_data and update_data["password"]:
        users[email]["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]  # No guardar password en plain text
    
    for key, value in update_data.items():
        if value is not None:
            users[email][key] = value
    
    save_users(users)
    
    # Recargar usuario actualizado
    updated_user_data = users[email]
    return User(**updated_user_data)

@router.put("/me/change-password")
def change_password(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    """Cambia la contraseña del usuario autenticado."""
    old_password = payload.get("old_password")
    new_password = payload.get("new_password")
    
    if not old_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere contraseña actual y nueva contraseña"
        )
    
    users = load_users()
    email = current_user.email
    
    if email not in users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar contraseña actual
    if not verify_password(old_password, users[email]["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña actual incorrecta"
        )
    
    # Actualizar contraseña
    users[email]["hashed_password"] = get_password_hash(new_password)
    save_users(users)
    
    return {"msg": "Contraseña actualizada correctamente"}