from datetime import datetime
from typing import Dict

from pydantic import Field

from app.contract.contract_models import ContractType
from app.shared.models.mongodb_models import CoreBaseModel, PyObjectId
from core.utils.datetime import utcnow


class Analytics(CoreBaseModel):
    """
    Model for storing analytics data to do with a user's contract
    """

    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    contracts_reviewed: Dict[ContractType, int] = Field(default_factory=dict)
    total_clauses: int = 0
    total_risky_clauses: int = 0
    total_contracts: int = 0
    total_pages: int = 0
    total_tokens_used: int = 0
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


#####################################################################
######## REQUEST MODELS #############################################
#####################################################################


class AnalyticsUpdateRequest(CoreBaseModel):
    contracts_reviewed: Dict[ContractType, int] = Field(default_factory=dict)
    total_clauses: int = 0
    total_risky_clauses: int = 0
    total_contracts: int = 0
    total_pages: int = 0
    total_tokens_used: int = 0


class AnalyticsIncrementRequest(CoreBaseModel):
    contracts_reviewed: Dict[ContractType, int] = Field(default_factory=dict)
    total_clauses: int = 0
    total_risky_clauses: int = 0
    total_contracts: int = 0
    total_pages: int = 0
    total_tokens_used: int = 0


#####################################################################
######## RESPONSE MODELS ############################################
#####################################################################


class AnalyticsResponse(Analytics):
    pass
