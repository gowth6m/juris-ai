from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId

from core.config import config
from core.exceptions import CustomException


class JWTDecodeError(CustomException):
    code = 401
    message = "Invalid token"


class JWTExpiredError(CustomException):
    code = 401
    message = "Token expired"


class JWTHandler:
    secret_key = config.JWT_SECRET_KEY
    algorithm = config.JWT_ALGORITHM
    expire_minutes = config.JWT_EXPIRE_MINUTES

    @staticmethod
    def encode(payload: dict) -> str:
        payload = {
            k: str(v) if isinstance(v, ObjectId) else v for k, v in payload.items()
        }
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=JWTHandler.expire_minutes
        )
        payload.update({"exp": expire})
        return jwt.encode(
            payload, JWTHandler.secret_key, algorithm=JWTHandler.algorithm
        )

    @staticmethod
    def decode(token: str) -> dict:
        try:
            return jwt.decode(
                token, JWTHandler.secret_key, algorithms=[JWTHandler.algorithm]
            )
        except jwt.ExpiredSignatureError as exception:
            raise JWTExpiredError() from exception
        except jwt.JWTError as exception:
            raise JWTDecodeError() from exception

    @staticmethod
    def decode_expired(token: str) -> dict:
        try:
            return jwt.decode(
                token,
                JWTHandler.secret_key,
                algorithms=[JWTHandler.algorithm],
                options={"verify_exp": False},
            )
        except jwt.JWTError as exception:
            raise JWTDecodeError() from exception
