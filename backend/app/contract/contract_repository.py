from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument

from app.contract.contract_models import Contract, ContractReview
from app.shared.models.mongodb_models import PyObjectId
from core.utils.datetime import utcnow


class ContractRepository:
    def __init__(
        self,
        contracts_collection: AsyncIOMotorCollection,
        contract_reviews_collection: AsyncIOMotorCollection,
    ):
        self.contracts_collection = contracts_collection
        self.contract_reviews_collection = contract_reviews_collection

    async def create_contract(self, contract: Contract) -> Contract | None:
        result = await self.contracts_collection.insert_one(
            contract.model_dump(by_alias=True)
        )
        contract.id = result.inserted_id
        return contract

    async def get_contract_by_id(self, contract_id: str) -> Optional[Contract]:
        contract_data = await self.contracts_collection.find_one(
            {"_id": ObjectId(contract_id)}
        )
        if contract_data:
            return Contract(**contract_data)
        return None

    async def update_contract(
        self, contract_id: PyObjectId, update_data: dict
    ) -> Optional[Contract]:
        update_data["updated_at"] = utcnow()
        contract_data = await self.contracts_collection.find_one_and_update(
            {"_id": ObjectId(contract_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if contract_data:
            return Contract(**contract_data)
        return None

    async def delete_contract(self, contract_id: str) -> bool:
        result = await self.contracts_collection.delete_one(
            {"_id": ObjectId(contract_id)}
        )
        return result.deleted_count > 0

    async def get_contracts(
        self,
        filter: dict,
        skip: Optional[int] = None,
        limit: Optional[int] = 100,
        projection: Optional[dict] = None,
        sort: Optional[List[tuple]] = [("created_at", -1)],
    ) -> List[Contract]:
        """
        Fetch contracts with optional projection, pagination, and sorting.
        """
        query = self.contracts_collection.find(filter, projection)

        if sort:
            query = query.sort(sort)

        if skip is not None:
            query = query.skip(skip)

        if limit is not None:
            query = query.limit(limit)

        # Optionally set a batch size for large datasets
        query = query.batch_size(100)

        contract_list = await query.to_list(length=limit if limit else None)
        return [Contract(**contract) for contract in contract_list]

    async def create_contract_review(
        self, contract_review: ContractReview
    ) -> ContractReview | None:
        existing_review = await self.get_contract_review_by_contract_id(
            contract_review.contract_id
        )
        if existing_review:
            contract_review.id = existing_review.id
            return await self.update_contract_review(contract_review)

        result = await self.contract_reviews_collection.insert_one(
            contract_review.model_dump(by_alias=True)
        )
        contract_review.id = result.inserted_id
        return contract_review

    async def update_contract_review(
        self, contract_review: ContractReview
    ) -> ContractReview | None:
        contract_review_data = contract_review.model_dump(by_alias=True)
        result = await self.contract_reviews_collection.update_one(
            {"_id": ObjectId(contract_review.id)},
            {"$set": contract_review_data},
        )
        if result.modified_count > 0:
            return contract_review
        return None

    async def get_contract_review_by_contract_id(
        self, contract_id: str
    ) -> Optional[ContractReview]:
        contract_review_data = await self.contract_reviews_collection.find_one(
            {"contract_id": ObjectId(contract_id)}
        )
        if contract_review_data:
            return ContractReview(**contract_review_data)
        return None
