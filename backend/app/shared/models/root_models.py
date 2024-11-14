from pydantic import BaseModel, Field

from core.config import config


class Root(BaseModel):
    message: str = Field(..., example=config.META_APP_NAME)
    version: str = Field(..., example="1.0.0")
    status: str = Field(..., example="OK")
