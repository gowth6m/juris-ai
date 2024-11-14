from motor.motor_asyncio import AsyncIOMotorClient

from core.config import config


class MongoDB:
    client: AsyncIOMotorClient = None


mongodb = MongoDB()


async def connect_to_mongo():
    """Initialize the MongoDB client if it hasn't been created yet."""
    if mongodb.client is None:
        try:
            mongodb.client = AsyncIOMotorClient(
                str(config.MONGODB_URL),
                maxPoolSize=10,
                minPoolSize=1,
                connectTimeoutMS=10000,
            )
            # Test the connection with a ping
            await mongodb.client.admin.command("ping")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise


def close_mongo_connection():
    """Close the MongoDB client connection."""
    if mongodb.client:
        mongodb.client.close()
        mongodb.client = None


async def get_mongo_client() -> AsyncIOMotorClient:
    """Return the MongoDB client, initializing it if necessary."""
    if mongodb.client is None:
        await connect_to_mongo()
    return mongodb.client


async def get_database(database_name: str):
    """Return the specified MongoDB database."""
    client = await get_mongo_client()
    database = client[database_name]
    return database


async def get_collection(database_name: str, collection_name: str):
    """Return the specified MongoDB collection."""
    database = await get_database(database_name)
    collection = database[collection_name]
    return collection
