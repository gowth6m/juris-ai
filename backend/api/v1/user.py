from fastapi import APIRouter, Depends

from app.container import Container
from app.user.user_controller import UserController
from app.user.user_models import (
    User,
    UserCreate,
    UserLogin,
    UserLoginResponse,
    UserResponse,
)
from core.dependencies.authentication import AuthenticationRequired
from core.dependencies.current_user import get_current_user

user_router = APIRouter()


@user_router.post("/register", status_code=201, response_model=UserResponse)
async def register_user(
    payload: UserCreate,
    auth_controller: UserController = Depends(Container.get_user_controller),
) -> UserResponse:
    return await auth_controller.register(user_data=payload)


@user_router.post("/login", response_model=UserLoginResponse)
async def login_user(
    payload: UserLogin,
    auth_controller: UserController = Depends(Container.get_user_controller),
) -> UserLoginResponse:
    return await auth_controller.login(user_data=payload)


@user_router.get(
    "/current",
    dependencies=[Depends(AuthenticationRequired)],
    response_model=UserResponse,
)
def get_user(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return current_user
