from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import StreamingResponse

from app.container import Container
from app.contract.contract_controller import ContractController
from app.contract.contract_models import (
    ContractExplainClauseRequest,
    ContractResponse,
    ContractResponseWithReview,
    ContractReviewCreateRequest,
)
from app.user.user_models import User
from core.dependencies.authentication import AuthenticationRequired
from core.dependencies.current_user import get_current_user
from core.exceptions.base import BadRequestException

contract_router = APIRouter()


@contract_router.post(
    "/upload",
    response_model=ContractResponse,
    dependencies=[Depends(AuthenticationRequired)],
)
async def upload_contract(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
):
    if file.content_type != "application/pdf":
        raise BadRequestException("Only PDF files are allowed.")

    print("Creating contract 0")

    pdf_content = await file.read()
    return await contract_controller.create_contract(
        title=title,
        file_content=pdf_content,
        current_user=current_user,
    )


@contract_router.get(
    "/all",
    response_model=List[ContractResponse],
    dependencies=[Depends(AuthenticationRequired)],
)
async def get_all_contracts(
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
    limit: Optional[int] = Query(None, gt=0),
    page: Optional[int] = Query(None, gt=0),
) -> List[ContractResponse]:
    contracts = await contract_controller.get_all_contracts(
        current_user=current_user, limit=limit, page=page
    )
    return contracts


@contract_router.get(
    "/{contract_id}",
    response_model=ContractResponse,
    dependencies=[Depends(AuthenticationRequired)],
)
async def get_contract_by_id(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
) -> ContractResponse:
    contract = await contract_controller.get_contract_by_id(
        contract_id=contract_id, current_user=current_user
    )
    return contract


@contract_router.post(
    "/{contract_id}/review",
    response_model=ContractResponseWithReview,
    dependencies=[Depends(AuthenticationRequired)],
)
async def review_contract(
    contract_id: str,
    payload: ContractReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
) -> ContractResponseWithReview:
    contract = await contract_controller.review_contract(
        contract_id=contract_id, current_user=current_user, payload=payload
    )
    return contract


@contract_router.post(
    "/{contract_id}/explain-clause",
    dependencies=[Depends(AuthenticationRequired)],
)
async def explain_clause(
    contract_id: str,
    payload: ContractExplainClauseRequest,
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
) -> StreamingResponse:
    contract = await contract_controller.explain_clause(
        contract_id=contract_id, current_user=current_user, payload=payload
    )
    return contract


@contract_router.get(
    "/{contract_id}/review",
    dependencies=[Depends(AuthenticationRequired)],
)
async def get_contract_review(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    contract_controller: ContractController = Depends(
        Container.get_contract_controller
    ),
) -> ContractResponseWithReview:
    contract_review = await contract_controller.get_contract_review_by_contract_id(
        contract_id=contract_id, current_user=current_user
    )
    return contract_review
