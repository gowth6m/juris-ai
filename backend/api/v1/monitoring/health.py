from fastapi import APIRouter

from app.shared.models.health_models import Health
from core.config import config

health_router = APIRouter()


@health_router.get("/")
async def health_check_v1() -> Health:
    return Health(version=config.RELEASE_VERSION, status="OK")
