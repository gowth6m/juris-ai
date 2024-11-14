from enum import Enum
from typing import ClassVar

import convertapi
import openai
from pydantic_settings import BaseSettings

from core.aws.secrets_manager import get_base_secrets


class EnvironmentType(str, Enum):
    DEVELOPMENT = "dev"
    PRODUCTION = "prod"
    LOCAL = "local"
    TEST = "test"


class MongoDBCollections(BaseSettings):
    USERS: str = "users"
    CONTRACTS: str = "contracts"
    CONTRACT_REVIEWS: str = "contract_reviews"
    ANALYTICS: str = "analytics"


class MongoDBDatabase(BaseSettings):
    CORE: str = "core"


class BaseConfig(BaseSettings):
    class Config:
        case_sensitive = True


class Config(BaseConfig):
    DEBUG: int = 0
    DEFAULT_LOCALE: str = "en_GB"
    RELEASE_VERSION: str = "1.0.0"
    META_APP_NAME: str = "Juris AI Backend Services"
    META_APP_DESCRIPTION: str = "API Service for Juris AI"
    ENVIRONMENT: str = EnvironmentType.LOCAL

    # Auth
    JWT_SECRET_KEY: str = get_base_secrets().JWT_SECRET_KEY
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24

    # Database
    MONGODB_URL: str = get_base_secrets().MONGODB_URL
    REDIS_URL: str = "redis://localhost:6379/7"

    # EXTERNAL SERVICES
    OPENAI_API_KEY: str = get_base_secrets().OPENAI_API_KEY
    CONVERT_API_SECRET: str = get_base_secrets().CONVERT_API_SECRET

    # MongoDB Databases and Collections
    MONGODB_COLLECTIONS: ClassVar[MongoDBCollections] = MongoDBCollections()
    MONGODB_DATABASES: ClassVar[MongoDBDatabase] = MongoDBDatabase()


config: Config = Config()
openai.api_key = config.OPENAI_API_KEY
convertapi.api_credentials = config.CONVERT_API_SECRET
