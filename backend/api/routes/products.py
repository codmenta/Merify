from fastapi import APIRouter
from db.json_handler import load_products
from typing import List
from models.order import Product

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins for production (e.g., ["https://your-frontend-domain.com"])
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

router = APIRouter()

@router.get("/products", response_model=List[Product])
def get_all_products():
    return load_products()
