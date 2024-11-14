from app.analytics.analytics_controller import AnalyticsController
from app.analytics.analytics_repository import AnalyticsRepository
from app.contract.contract_controller import ContractController, ContractRepository
from app.user.user_controller import UserController
from app.user.user_repository import UserRepository
from core.config import config
from core.database.mongodb import get_collection


class Container:
    """
    Central container to provide dependencies for repositories and controllers.
    Provides static access to dependencies.
    """

    @classmethod
    async def get_user_repository(cls) -> UserRepository:
        collection = await get_collection(
            config.MONGODB_DATABASES.CORE, config.MONGODB_COLLECTIONS.USERS
        )
        return UserRepository(collection)

    @classmethod
    async def get_contract_repository(cls) -> ContractRepository:
        contracts_collection = await get_collection(
            config.MONGODB_DATABASES.CORE, config.MONGODB_COLLECTIONS.CONTRACTS
        )
        contract_reviews_collection = await get_collection(
            config.MONGODB_DATABASES.CORE, config.MONGODB_COLLECTIONS.CONTRACT_REVIEWS
        )

        return ContractRepository(contracts_collection, contract_reviews_collection)

    @classmethod
    async def get_analytics_repository(cls) -> AnalyticsRepository:
        analytics_collection = await get_collection(
            config.MONGODB_DATABASES.CORE, config.MONGODB_COLLECTIONS.ANALYTICS
        )
        return AnalyticsRepository(analytics_collection)

    @classmethod
    async def get_user_controller(cls) -> UserController:
        user_repo = await cls.get_user_repository()
        return UserController(user_repo=user_repo)

    @classmethod
    async def get_contract_controller(cls) -> ContractController:
        contract_repo = await cls.get_contract_repository()
        analytics_controller = await cls.get_analytics_controller()
        return ContractController(
            contract_repo=contract_repo, analytics_controller=analytics_controller
        )

    @classmethod
    async def get_analytics_controller(cls) -> AnalyticsController:
        analytics_repo = await cls.get_analytics_repository()
        return AnalyticsController(analytics_repo=analytics_repo)
