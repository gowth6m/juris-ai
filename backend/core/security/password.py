from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


class PasswordHandler:
    _hasher = PasswordHasher()

    @staticmethod
    def hash(password: str) -> str:
        return PasswordHandler._hasher.hash(password)

    @staticmethod
    def verify(hashed_password: str, plain_password: str) -> bool:
        try:
            return PasswordHandler._hasher.verify(hashed_password, plain_password)
        except VerifyMismatchError:
            return False
