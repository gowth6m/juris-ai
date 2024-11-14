from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.shared.models.mongodb_models import CoreBaseModel, PyObjectId
from core.utils.datetime import utcnow


class ContractType(str, Enum):
    SERVICE_LEVEL_AGREEMENT = "service_level_agreement"
    MASTER_SERVICE_AGREEMENT = "master_service_agreement"
    NON_DISCLOSURE_AGREEMENT = "non_disclosure_agreement"
    OTHER = "other"


class ContractIndustry(str, Enum):
    TECHNOLOGY = "technology"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    OTHER = "other"


class ContractJurisdiction(str, Enum):
    UNITED_STATES = "united_states"
    UNITED_KINGDOM = "united_kingdom"
    OTHER = "other"


#####################################################################
######## DATABASE MODEL #############################################
#####################################################################


class Clause(BaseModel):
    key: str  # The key of the clause e.g. "1.1" or "2.3.4"
    content: str


class RiskyClause(BaseModel):
    key: str
    content: str
    risk_type: str
    risk_level: int
    concerns: str
    recommendations: str


class ReviewAnalytics(BaseModel):
    tokens_used: int
    total_time_taken: float
    total_clauses: int
    risky_clauses: int
    total_batches: int
    rate_limit_hits: int
    average_time_per_batch: float
    success_rate: float  # Percentage of clauses successfully parsed


class Contract(CoreBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    processed_html: str
    original_html: str
    uploaded_by: PyObjectId
    clauses: Optional[List[Clause]] = Field(default_factory=list)
    pages: Optional[int]
    has_review: bool = False
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class ContractReview(CoreBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    contract_id: PyObjectId
    risky_clauses: List[RiskyClause] = Field(default_factory=list)
    contract_type: ContractType = ContractType.OTHER
    contract_industry: ContractIndustry = ContractIndustry.OTHER
    contract_jurisdiction: ContractJurisdiction = ContractJurisdiction.OTHER
    summary_checklist: Optional[str] = None
    analytics: ReviewAnalytics
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


#####################################################################
######## REQUEST MODELS #############################################
#####################################################################


class ContractReviewCreateRequest(BaseModel):
    jurisdiction: ContractJurisdiction = ContractJurisdiction.OTHER
    industry: ContractIndustry = ContractIndustry.OTHER
    contract_type: ContractType = ContractType.OTHER


class ContractExplainClauseRequest(BaseModel):
    clause: str


#####################################################################
######## RESPONSE MODELS ############################################
#####################################################################


class ContractResponse(Contract):
    pass


class ContractResponseWithReview(ContractResponse):
    review: Optional[ContractReview] = None
