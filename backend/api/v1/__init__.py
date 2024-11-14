from fastapi import APIRouter

from api.v1.analytics import analytics_router
from api.v1.contract import contract_router
from api.v1.monitoring import monitoring_router
from api.v1.user import user_router

v1_router = APIRouter()
v1_router.include_router(monitoring_router, prefix="/monitoring")
v1_router.include_router(user_router, prefix="/user", tags=["User"])
v1_router.include_router(contract_router, prefix="/contract", tags=["Contract"])
v1_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
