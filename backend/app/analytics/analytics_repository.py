from motor.motor_asyncio import AsyncIOMotorCollection

from app.analytics.analytics_models import (
    Analytics,
    AnalyticsIncrementRequest,
    AnalyticsResponse,
    AnalyticsUpdateRequest,
)
from core.utils.datetime import utcnow


class AnalyticsRepository:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_analytics(self, analytics: Analytics) -> AnalyticsResponse | None:
        result = await self.collection.insert_one(analytics.model_dump(by_alias=True))
        analytics.id = result.inserted_id
        return analytics

    async def get_analytics_by_user_id(self, user_id: str) -> AnalyticsResponse | None:
        analytics_data = await self.collection.find_one({"user_id": user_id})
        if analytics_data:
            return AnalyticsResponse(**analytics_data)
        return None

    async def update_analytics(
        self, user_id: str, update_data: AnalyticsUpdateRequest
    ) -> AnalyticsResponse | None:
        analytics_data = await self.collection.find_one_and_update(
            {"user_id": user_id},
            {"$set": update_data},
            return_document=True,
        )
        if analytics_data:
            return AnalyticsResponse(**analytics_data)
        return None

    async def delete_analytics(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0

    async def increment_analytics(
        self, user_id: str, increment_data: AnalyticsIncrementRequest
    ) -> AnalyticsResponse | None:
        """
        Increment specified fields in the analytics document for a user.
        Creates the document if it does not exist.
        """
        # Build the $inc update dictionary
        inc_dict = {}
        for key, value in increment_data.model_dump().items():
            if key == "contracts_reviewed":
                for contract_type, count in value.items():
                    field_name = f"contracts_reviewed.{contract_type}"
                    inc_dict[field_name] = count
            else:
                inc_dict[key] = value

        # Perform the update with $inc and $setOnInsert for created_at
        analytics_data = await self.collection.find_one_and_update(
            {"user_id": user_id},
            {
                "$inc": inc_dict,
                "$set": {"updated_at": utcnow()},
                "$setOnInsert": {"created_at": utcnow()},
            },
            upsert=True,
            return_document=True,
        )
        return AnalyticsResponse(**analytics_data)
