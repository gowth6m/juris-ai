from app.analytics.analytics_models import Analytics, AnalyticsIncrementRequest
from app.analytics.analytics_repository import AnalyticsRepository, AnalyticsResponse
from app.user.user_models import User


class AnalyticsController:
    def __init__(self, analytics_repo: AnalyticsRepository):
        self.analytics_repo = analytics_repo

    async def increment_analytics_fields(
        self, current_user: User, increment_data: AnalyticsIncrementRequest
    ) -> AnalyticsResponse:
        """
        Increment analytics fields for a user.
        """
        analytics = await self.analytics_repo.increment_analytics(
            current_user.id, increment_data
        )
        if analytics is None:
            analytics = Analytics(user_id=current_user.id)
            for key, value in increment_data.model_dump().items():
                if key == "contracts_reviewed":
                    for contract_type, count in value.items():
                        analytics.contracts_reviewed[contract_type] += count
                else:
                    setattr(analytics, key, getattr(analytics, key) + value)
            analytics = await self.analytics_repo.create_analytics(analytics)
        return analytics

    async def get_analytics(self, current_user: User) -> AnalyticsResponse:
        """
        Get analytics for a user.
        """
        analytics = await self.analytics_repo.get_analytics_by_user_id(current_user.id)

        if analytics is None:
            analytics = Analytics(user_id=current_user.id)
            created_analytics = await self.analytics_repo.create_analytics(analytics)
            return created_analytics

        return analytics
