import logging
from enum import Enum
from typing import Optional

import openai
from openai.types.chat.chat_completion import ChatCompletion

from core.config import config

logger = logging.getLogger(__name__)


class OpenAIModels(Enum):
    GPT_4 = "gpt-4"
    GPT_3_5_TURBO = "gpt-3.5-turbo"


class OpenAIClient:
    def __init__(self, api_key: str, model: str):
        self.client = openai.AsyncOpenAI(
            api_key=api_key,
        )
        self.model = model
        self.temperature = 0.3

    async def analyze_clauses(
        self, system_prompt: str, user_prompt: str
    ) -> ChatCompletion:
        """
        Call OpenAI's API to analyze clauses.
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self.temperature,
            )
            return response
        except openai.RateLimitError as e:
            logger.error(f"Rate limit error: {e}")
            raise e
        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise e


def get_openai_client(
    model: Optional[OpenAIModels] = OpenAIModels.GPT_3_5_TURBO,
) -> OpenAIClient:
    return OpenAIClient(
        api_key=config.OPENAI_API_KEY,
        model=model.value,
    )
