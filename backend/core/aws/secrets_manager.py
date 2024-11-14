import json
import os
from functools import lru_cache

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

ENVIRONMENT = os.getenv("ENVIRONMENT")
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


class SecretsManager:
    def __init__(self):
        if ENVIRONMENT == "local":
            self.client = boto3.client(
                "secretsmanager",
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
        else:
            self.client = boto3.client("secretsmanager", region_name=AWS_REGION)

    def get_secret(self, secret_name: str) -> str:
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            if "SecretString" in response:
                return response["SecretString"]
            else:
                raise HTTPException(
                    status_code=500, detail="Secret has no valid string value."
                )
        except (BotoCoreError, ClientError) as e:
            raise HTTPException(
                status_code=500, detail=f"Error retrieving secret: {str(e)}"
            )


@lru_cache()
def get_secrets_manager() -> SecretsManager:
    return SecretsManager()


def get_secret_value(secret_name: str) -> str:
    secrets_manager = get_secrets_manager()
    return secrets_manager.get_secret(secret_name)


############################################


class BaseSecrets(BaseModel):
    CONVERT_API_SECRET: str
    JWT_SECRET_KEY: str
    MONGODB_URL: str
    OPENAI_API_KEY: str


def get_base_secrets() -> BaseSecrets:
    secrets_manager = get_secrets_manager()
    try:
        base_secrets = secrets_manager.get_secret("backend/base")
        base_secrets_obj = json.loads(base_secrets)
        return BaseSecrets(**base_secrets_obj)
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(
            status_code=500, detail=f"Error parsing or validating secret data: {str(e)}"
        )
