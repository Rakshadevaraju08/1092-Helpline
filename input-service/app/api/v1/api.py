from fastapi import APIRouter
from app.api.v1.endpoints import input

api_router = APIRouter()
api_router.include_router(input.router, prefix="/pipeline", tags=["pipeline"])