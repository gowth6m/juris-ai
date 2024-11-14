from fastapi import HTTPException, status

from app.user.user_models import (
    User,
    UserCreate,
    UserLogin,
    UserLoginResponse,
    UserResponse,
)
from app.user.user_repository import UserRepository
from core.exceptions.base import BadRequestException
from core.security import JWTHandler, PasswordHandler


class UserController:
    def __init__(self, user_repo: UserRepository):
        self.user_repo: UserRepository = user_repo

    async def register(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user.

        Args:
            user_data (UserCreate): The data required to create a new user.

        Returns:
            UserResponse: The created user's response data.

        Raises:
            HTTPException: If the email is already registered or user creation fails.
        """
        existing_user = await self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Email already registered", "field_name": "email"},
            )

        user_for_db = User(
            email=user_data.email,
            hashed_password=PasswordHandler.hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )

        user = await self.user_repo.create_user(user_for_db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"message": "User creation failed due to an internal error."},
            )

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
        )

    async def login(self, user_data: UserLogin) -> UserResponse:
        """
        Authenticate and login a user.

        Args:
            user_data (UserLogin): The user's login credentials.

        Returns:
            UserResponse: The authenticated user's response data.

        Raises:
            HTTPException: If the user is not found or the password is invalid.
        """
        user = await self.user_repo.get_user_by_email(user_data.email)

        if not user:
            raise BadRequestException("Invalid credentials")

        if not PasswordHandler.verify(user.hashed_password, user_data.password):
            raise BadRequestException("Invalid credentials")

        return UserLoginResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
            ),
            access_token=JWTHandler.encode(payload={"user_id": user.id}),
            refresh_token=JWTHandler.encode(payload={"sub": "refresh_token"}),
        )

    async def get_user_by_id(self, user_id: str) -> UserResponse:
        """
        Retrieve a user by their ID.

        Args:
            user_id (str): The ID of the user to retrieve.

        Returns:
            UserResponse: The requested user's response data.

        Raises:
            HTTPException: If the user is not found.
        """
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "User not found", "field_name": "user_id"},
            )

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
        )
