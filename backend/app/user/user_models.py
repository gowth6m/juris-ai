from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from app.shared.models.mongodb_models import CoreBaseModel, PyObjectId
from core.utils.datetime import utcnow


class User(CoreBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    hashed_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


#####################################################################
######## REQUEST MODELS #############################################
#####################################################################


class UserCreate(CoreBaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(CoreBaseModel):
    email: EmailStr
    password: str


#####################################################################
######## RESPONSE MODELS ############################################
#####################################################################


class UserResponse(CoreBaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLoginResponse(CoreBaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
