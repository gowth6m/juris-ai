from fastapi import APIRouter

from app.shared.models.root_models import Root
from core.config import config

from .v1 import v1_router

router = APIRouter()


@router.get("/", tags=["Health"])
async def base_health_check() -> Root:
    return {
        "message": config.META_APP_NAME,
        "version": config.RELEASE_VERSION,
        "status": "OK",
    }


router.include_router(v1_router, prefix="/v1")


__all__ = ["router"]
