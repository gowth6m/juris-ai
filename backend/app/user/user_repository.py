from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument

from app.shared.models.mongodb_models import PyObjectId
from app.user.user_models import User
from core.utils.datetime import utcnow


class UserRepository:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_user(self, user: User) -> User | None:
        result = await self.collection.insert_one(user.model_dump(by_alias=True))
        user.id = result.inserted_id
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        user_data = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return User(**user_data)
        return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        user_data = await self.collection.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None

    async def update_user(
        self, user_id: PyObjectId, update_data: dict
    ) -> Optional[User]:
        update_data["updated_at"] = utcnow()
        user_data = await self.collection.find_one_and_update(
            {"_id": user_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if user_data:
            return User(**user_data)
        return None

    async def delete_user(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
