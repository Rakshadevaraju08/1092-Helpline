from fastapi import APIRouter
from app.api.v1.endpoints import analysis, summary, pipeline

api_router = APIRouter()
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(summary.router, prefix="/summary", tags=["summary"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
