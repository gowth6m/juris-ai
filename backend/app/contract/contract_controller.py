from typing import AsyncGenerator, List, Optional

from bson import ObjectId
from fastapi import HTTPException, logger, status
from fastapi.responses import StreamingResponse

from app.analytics.analytics_controller import AnalyticsController
from app.analytics.analytics_models import AnalyticsIncrementRequest
from app.contract.contract_models import (
    Contract,
    ContractExplainClauseRequest,
    ContractResponse,
    ContractResponseWithReview,
    ContractReview,
    ContractReviewCreateRequest,
)
from app.contract.contract_processor import ContractProcessor
from app.contract.contract_repository import ContractRepository
from app.contract.contract_review import ContractReviewer
from app.user.user_models import User


class ContractController:
    def __init__(
        self,
        contract_repo: ContractRepository,
        analytics_controller: AnalyticsController,
    ):
        self.contract_repo = contract_repo
        self.contract_reviewer = ContractReviewer()
        self.analytics_controller = analytics_controller

    async def create_contract(
        self, title: str, file_content: bytes, current_user: User
    ) -> ContractResponse:
        """
        Create a new contract and process its clauses.
        """
        try:
            # Convert PDF to HTML and get the number of pages
            original_html_content, pages = ContractProcessor.convert_pdf_to_html(
                file_content
            )
            processed_html_content, clauses = ContractProcessor.mark_clauses(
                original_html_content
            )

            # Prepare and save the contract
            contract = await self.contract_repo.create_contract(
                Contract(
                    title=title,
                    processed_html=processed_html_content,
                    original_html=original_html_content,
                    uploaded_by=current_user.id,
                    clauses=clauses,
                    pages=pages,
                )
            )

            return ContractResponse(**contract.model_dump(by_alias=True))

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred: {str(e)}",
            )

    async def get_contract_by_id(
        self, contract_id: str, current_user: User
    ) -> ContractResponse:
        """
        Get a contract by its ID.
        """
        contract = await self.contract_repo.get_contract_by_id(contract_id)

        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found.",
            )

        return ContractResponse(**contract.model_dump(by_alias=True))

    async def get_all_contracts(
        self,
        current_user: User,
        page: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> List[ContractResponse]:
        """
        Get all contracts for the current user with optional pagination.
        """
        try:
            filter_criteria = {"uploaded_by": ObjectId(current_user.id)}

            if page is not None and limit is not None:
                # Calculate the offset for pagination
                offset = (page - 1) * limit
                contracts = await self.contract_repo.get_contracts(
                    filter=filter_criteria,
                    skip=offset,
                    limit=limit,
                )
            else:
                # Fetch all contracts without pagination
                contracts = await self.contract_repo.get_contracts(
                    filter=filter_criteria
                )

            # Convert the list of contracts to ContractResponse
            return [
                ContractResponse(**contract.model_dump(by_alias=True))
                for contract in contracts
            ]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while fetching contracts: {str(e)}",
            )

    async def review_contract(
        self, contract_id: str, current_user: User, payload: ContractReviewCreateRequest
    ) -> ContractResponseWithReview:
        """
        Review a contract and save the review data.
        """

        # Fetch the contract from the repository
        contract = await self.contract_repo.get_contract_by_id(contract_id)

        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found.",
            )

        if contract.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to review this contract.",
            )

        # Analyze the contract using the ContractReviewer class
        high_risk_clauses, summary_checklist, analytics = (
            await self.contract_reviewer.create_high_risk_clauses(
                contract=contract, contract_type=payload.contract_type
            )
        )

        contract_review_for_db = ContractReview(
            contract_id=ObjectId(contract_id),
            risky_clauses=high_risk_clauses,
            contract_type=payload.contract_type,
            contract_industry=payload.industry,
            contract_jurisdiction=payload.jurisdiction,
            summary_checklist=summary_checklist,
            analytics=analytics,
        )

        review_result = await self.contract_repo.create_contract_review(
            contract_review_for_db
        )
        if review_result is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while saving the contract review.",
            )

        contract = await self.contract_repo.update_contract(
            contract_id=contract_id,
            update_data={"has_review": True},
        )
        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while updating the contract.",
            )

        # Update analytics for the user
        analytics_to_increment = AnalyticsIncrementRequest(
            contracts_reviewed={payload.contract_type: 1},
            total_clauses=len(contract.clauses),
            total_risky_clauses=len(high_risk_clauses),
            total_contracts=1,
            total_pages=contract.pages,
            total_tokens_used=analytics.tokens_used,
        )

        updated_analytics = await self.analytics_controller.increment_analytics_fields(
            current_user=current_user, increment_data=analytics_to_increment
        )
        if updated_analytics is None:
            logger.error(
                "An error occurred while updating analytics for the user.",
                extra={"user_id": current_user.id},
            )

        return ContractResponseWithReview(
            **contract.model_dump(by_alias=True),
            review=review_result,
        )

    async def explain_clause(
        self,
        contract_id: str,
        current_user: "User",
        payload: "ContractExplainClauseRequest",
    ) -> StreamingResponse:
        """
        Explain the clauses in the specified contract.
        """
        # Fetch the contract by ID
        contract = await self.contract_repo.get_contract_by_id(contract_id)
        contract_review = await self.contract_repo.get_contract_review_by_contract_id(
            contract_id
        )

        if contract is None or contract_review is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found.",
            )

        # Check if the user is authorized to view the contract
        if contract.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this contract.",
            )

        # Stream explanation for the specified clause
        async def explanation_generator() -> AsyncGenerator[str, None]:
            async for chunk in self.contract_reviewer.explain_clause_stream(
                clause=payload.clause, contract_type=contract_review.contract_type
            ):
                yield chunk

        # Update analytics for the clause

        return StreamingResponse(explanation_generator(), media_type="text/plain")

    async def get_contract_review_by_contract_id(
        self, contract_id: str, current_user: User
    ) -> ContractResponseWithReview:
        """
        Get a contract review by its contract ID.
        """
        contract = await self.contract_repo.get_contract_by_id(contract_id)

        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found.",
            )

        contract_review = await self.contract_repo.get_contract_review_by_contract_id(
            contract_id
        )

        if contract_review is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract review not found.",
            )

        return ContractResponseWithReview(
            **contract.model_dump(by_alias=True),
            review=contract_review,
        )
