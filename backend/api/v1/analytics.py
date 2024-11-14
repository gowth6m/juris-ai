from fastapi import APIRouter, Depends

from app.analytics.analytics_controller import AnalyticsController
from app.analytics.analytics_models import AnalyticsResponse
from app.container import Container
from app.user.user_models import User
from core.dependencies.authentication import AuthenticationRequired
from core.dependencies.current_user import get_current_user

analytics_router = APIRouter()


@analytics_router.get(
    "/overview",
    dependencies=[Depends(AuthenticationRequired)],
)
async def get_overview(
    current_user: User = Depends(get_current_user),
    analytics_controller: AnalyticsController = Depends(
        Container.get_analytics_controller
    ),
) -> AnalyticsResponse:
    analytics = await analytics_controller.get_analytics(current_user=current_user)
    return analytics
