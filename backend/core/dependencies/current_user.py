from fastapi import Depends, Request

from app.container import Container
from app.user.user_controller import UserController
from core.exceptions.base import NotFoundException, UnauthorizedException


async def get_current_user(
    request: Request,
    user_controller: UserController = Depends(Container.get_user_controller),
):
    if not request.user or not request.user.id:
        raise UnauthorizedException("Authentication failed or user not set in request.")

    user = await user_controller.get_user_by_id(request.user.id)
    if not user:
        raise NotFoundException("User not found.")

    return user
