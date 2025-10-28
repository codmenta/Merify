# backend/api/routes/devolutions.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/devolutions", tags=["Devolutions"])

class DevolutionRequest(BaseModel):
    order_id: str
    email: str
    reason: Optional[str] = None

class DevolutionResponse(BaseModel):
    devolution_id: str
    message: str

@router.post("/", response_model=DevolutionResponse)
def create_devolution(request: DevolutionRequest):
    # Aquí iría la lógica real de devolución (guardar en DB, etc.)
    # Por ahora, solo simula una respuesta
    import random
    devolution_id = f"DEV-{random.randint(100000,999999)}"
    return DevolutionResponse(
        devolution_id=devolution_id,
        message=f"Solicitud de devolución recibida para la orden {request.order_id}."
    )
