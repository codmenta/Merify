from fastapi import APIRouter
from db.json_handler import load_products
from typing import List
from models.order import Product

router = APIRouter()

@router.get("/products", response_model=List[Product])
def get_all_products():
    return load_products()
