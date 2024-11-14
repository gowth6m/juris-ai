import asyncio
import json
import logging
import re
import time
from typing import AsyncGenerator, Dict, List, Tuple

import aiohttp
import backoff

from app.contract.contract_models import (
    Clause,
    Contract,
    ContractType,
    ReviewAnalytics,
    RiskyClause,
)
from core.config import config

logger = logging.getLogger(__name__)


class ContractReviewer:
    def __init__(self):
        self.openai_api_key = config.OPENAI_API_KEY
        self.model = "gpt-3.5-turbo"
        self.temperature = 0.3
        self.rate_limit_hits = 0
        self.max_concurrent_requests = 5
        self.timeout = 60  # Total timeout for the entire processing (same as lambda timeout for now)
        self.risk_level_threshold = 1

        # Mapping of ContractType to their respective system prompts
        self.contract_type_prompts = {
            "master_service_agreement": (
                "You are a legal assistant specialized in Master Service Agreements (MSA). "
                "Analyze each clause for potential risks such as scope ambiguity, liability limits, "
                "termination conditions, and compliance issues. Provide the analysis in structured JSON format."
            ),
            "non_disclosure_agreement": (
                "You are a legal assistant specialized in Non-Disclosure Agreements (NDA). "
                "Analyze each clause for potential risks related to confidentiality breaches, duration of obligations, "
                "exclusions, and enforcement mechanisms. Provide the analysis in structured JSON format."
            ),
            "sales_contract": (
                "You are a legal assistant specialized in Sales Contracts. "
                "Analyze each clause for potential risks such as payment terms, delivery obligations, "
                "warranty provisions, and dispute resolution mechanisms. Provide the analysis in structured JSON format."
            ),
        }

        self.contract_type_prompts_for_explanation = {
            "master_service_agreement": "You are a legal assistant with expertise in Master Service Agreements (MSA). Explain the clause in detail.",
            "non_disclosure_agreement": "You are a legal assistant with expertise in Non-Disclosure Agreements (NDA). Explain the clause in detail.",
            "sales_contract": "You are a legal assistant with expertise in Sales Contracts. Explain the clause in detail.",
        }

    async def create_high_risk_clauses(
        self, contract: Contract, contract_type: ContractType, batch_size: int = 25
    ) -> Tuple[List[RiskyClause], str, ReviewAnalytics]:
        """
        Analyze contract clauses to identify high-risk clauses based on the contract type
        and generate a summary checklist.

        Args:
            contract (Contract): The contract containing clauses to be analyzed.
            contract_type (ContractType): The type of the contract (e.g., MSA, NDA).
            batch_size (int, optional): Number of clauses to process in each batch. Defaults to 25.

        Returns:
            Tuple[List[RiskyClause], str, ReviewAnalytics]: A tuple containing the list of identified risky clauses,
            the summary checklist, and analytics data.
        """
        system_prompt = self._build_system_prompt(contract_type)
        clauses = contract.clauses
        analyzed_clauses = []
        tokens_used = 0
        total_time_start = time.time()
        total_clauses = len(clauses)
        total_batches = 0
        successful_clauses = 0

        # Break clauses into batches
        batches = [
            clauses[i : i + batch_size] for i in range(0, len(clauses), batch_size)
        ]
        total_batches = len(batches)

        semaphore = asyncio.Semaphore(self.max_concurrent_requests)

        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers={"Authorization": f"Bearer {self.openai_api_key}"},
        ) as session:
            tasks = []
            for batch_number, batch in enumerate(batches, start=1):
                task = asyncio.create_task(
                    self.process_batch_with_semaphore(
                        semaphore,
                        session,
                        system_prompt,
                        batch,
                        contract_type,
                        batch_number,
                    )
                )
                tasks.append(task)

            # Wait for all tasks to complete within the total timeout
            try:
                results = await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True), timeout=self.timeout
                )
            except asyncio.TimeoutError:
                logger.error(f"Processing timed out after {self.timeout} seconds.")
                results = []

            # Collect results
            for result in results:
                if isinstance(result, Exception):
                    logger.error(f"Batch processing resulted in exception: {result}")
                    continue
                if result:
                    (
                        batch_analyzed_clauses,
                        batch_tokens,
                        batch_successful_clauses,
                    ) = result
                    analyzed_clauses.extend(batch_analyzed_clauses)
                    tokens_used += batch_tokens
                    successful_clauses += batch_successful_clauses

        # Generate the summary checklist
        summary_checklist = await self.generate_summary_checklist(
            contract, analyzed_clauses
        )

        total_time_end = time.time()
        total_time_taken = total_time_end - total_time_start
        risky_clauses = len(analyzed_clauses)
        average_time_per_batch = (
            total_time_taken / total_batches if total_batches else 0
        )
        success_rate = (
            (successful_clauses / total_clauses) * 100 if total_clauses else 0
        )

        analytics = ReviewAnalytics(
            tokens_used=tokens_used,
            total_time_taken=total_time_taken,
            total_clauses=total_clauses,
            risky_clauses=risky_clauses,
            total_batches=total_batches,
            rate_limit_hits=self.rate_limit_hits,
            average_time_per_batch=average_time_per_batch,
            success_rate=success_rate,
        )

        return analyzed_clauses, summary_checklist, analytics

    async def process_batch_with_semaphore(
        self, semaphore, session, system_prompt, batch, contract_type, batch_number
    ):
        async with semaphore:
            return await self.process_batch(
                session, system_prompt, batch, contract_type, batch_number
            )

    async def process_batch(
        self, session, system_prompt, batch, contract_type, batch_number
    ):
        user_prompt = self._build_user_batch_prompt(batch)
        max_retries = 3
        retry_delay = 2  # seconds

        # Create a mapping from clause keys to clause contents
        clause_key_to_content = {clause.key: clause.content for clause in batch}

        for attempt in range(1, max_retries + 1):
            try:
                start_time = time.time()
                response = await self._call_openai_api_with_backoff(
                    session, system_prompt, user_prompt
                )
                end_time = time.time()

                # Extract content based on response type
                if isinstance(response, dict):
                    # Extract 'content' from the response
                    choices = response.get("choices", [])
                    if not choices:
                        logger.error(
                            f"No 'choices' found in the response for batch {batch_number}: {response}"
                        )
                        continue  # Proceed to the next attempt

                    message = choices[0].get("message", {})
                    content = message.get("content", "")
                    if not content:
                        logger.error(
                            f"No 'content' found in the response for batch {batch_number}: {response}"
                        )
                        continue  # Proceed to the next attempt

                elif isinstance(response, str):
                    content = response
                else:
                    logger.error(
                        f"Unexpected response type ({type(response)}) for batch {batch_number}: {response}"
                    )
                    continue  # Proceed to the next attempt

                # Check if content is JSON
                if not self._is_potential_json(content):
                    logger.error(
                        f"Content does not appear to be JSON in batch {batch_number}: {content}"
                    )
                    continue  # Proceed to the next attempt

                # Extract JSON content
                cleaned_content = self._extract_json_content(content)
                if not self._is_potential_json(cleaned_content):
                    logger.error(
                        f"Extracted content does not appear to be JSON in batch {batch_number}: {cleaned_content}"
                    )
                    continue  # Proceed to the next attempt

                # Attempt to parse the JSON
                batch_analyzed_clauses = self._parse_batch_analyzed_clauses(
                    cleaned_content, clause_key_to_content
                )
                batch_tokens = 0  # Update if tokens are tracked
                batch_successful_clauses = len(batch_analyzed_clauses)

                logger.debug(
                    f"Batch {batch_number} processed in {end_time - start_time:.2f} seconds"
                )

                return batch_analyzed_clauses, batch_tokens, batch_successful_clauses

            except Exception as e:
                error_message = str(e).lower()
                if "rate limit" in error_message or "429" in error_message:
                    self.rate_limit_hits += 1
                    logger.warning(
                        f"Rate limit hit for batch {batch_number} on attempt {attempt}. Retrying..."
                    )
                else:
                    logger.error(
                        f"Error processing batch {batch_number} on attempt {attempt}: {e}"
                    )
                if attempt < max_retries:
                    await asyncio.sleep(retry_delay * attempt)
                else:
                    logger.error(
                        f"Failed to process batch {batch_number} after {max_retries} attempts."
                    )
        return None

    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientResponseError, asyncio.TimeoutError, ValueError),
        max_time=10,
        max_tries=3,
        jitter=backoff.full_jitter,
    )
    async def _call_openai_api_with_backoff(
        self, session, system_prompt: str, user_prompt: str
    ):
        async with session.post(
            "https://api.openai.com/v1/chat/completions",
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": self.temperature,
            },
        ) as response:
            try:
                response_data = await response.json()
            except aiohttp.ContentTypeError:
                response_text = await response.text()
                logger.error(f"Failed to parse JSON response: {response_text}")
                # Return the raw text to be handled by the caller
                return response_text

            if response.status == 429:
                self.rate_limit_hits += 1
                retry_after = response.headers.get("Retry-After")
                if retry_after:
                    logger.warning(
                        f"Rate limit hit. Retrying after {retry_after} seconds."
                    )
                    await asyncio.sleep(float(retry_after))
                else:
                    logger.warning("Rate limit hit. Retrying with exponential backoff.")
                raise aiohttp.ClientResponseError(
                    status=response.status,
                    message="Rate limit exceeded",
                    request_info=response.request_info,
                    headers=response.headers,
                )

            if response.status != 200:
                logger.error(
                    f"Error response from OpenAI API (status {response.status}): {response_data}"
                )
                response.raise_for_status()

            # Log token usage from headers if available
            remaining_tokens = response.headers.get("x-ratelimit-remaining-tokens")
            reset_time = response.headers.get("x-ratelimit-reset-tokens")
            if remaining_tokens and reset_time:
                logger.debug(
                    f"Remaining tokens: {remaining_tokens}, Tokens reset in: {reset_time} seconds"
                )

            return response_data

    async def generate_summary_checklist(
        self, contract: Contract, analyzed_clauses: List[RiskyClause]
    ) -> str:
        """
        Generate a summary checklist based on the reviewed contract.

        Args:
            contract (Contract): The contract being reviewed.
            analyzed_clauses (List[RiskyClause]): The list of identified risky clauses.

        Returns:
            str: The generated summary checklist.
        """
        system_prompt = (
            "You are a legal assistant tasked with creating a brief checklist summarizing a contract review."
            " The checklist should capture all core aspects of a typical contract review, ensuring that the summary is clear, concise, and comprehensive."
        )

        # Construct the user prompt based on provided instructions
        user_prompt = (
            "Create a brief checklist to summarize the contracts you have reviewed. "
            "Make sure the checklist captures all core aspects of a typical contract review, ensuring that the summary is clear, concise, and comprehensive.\n\n"
            "# Checklist Items\n"
            "- **Parties Involved**: Identify all parties to the contract, including any third parties.\n"
            "- **Contract Objective**: Summarise the purpose of the contract, including key services or goods provided.\n"
            "- **Key Dates**: Note start and end dates, as well as important deadlines or milestones.\n"
            "- **Payment Terms**: Specify any payment schedules, amounts, or reimbursement details.\n"
            "- **Obligations of Parties**: Outline the major responsibilities of each party and any conditions that must be upheld.\n"
            "- **Termination Clause**: Summarise the conditions under which the contract can be terminated by either party.\n"
            "- **Liability and Indemnity**: Note any clauses related to liability limits, indemnity, or insurance obligations.\n"
            "- **Confidentiality**: Identify any clauses dealing with confidentiality or non-disclosure agreements.\n"
            "- **Governing Law & Jurisdiction**: Specify which country's law applies and which courts have jurisdiction.\n"
            "- **Penalty & Breach**: Note any penalties for breaches of contract and the remedies available to the non-breaching party.\n"
            "- **Dispute Resolution**: Summarise the methods prescribed for dispute resolution (e.g., mediation, arbitration).\n"
            "- **Exclusivity**: Check if any clauses give one party exclusive rights or restrict dealings outside of the contract.\n"
            "- **Amendment Process**: State how amendments to the contract can be made and who needs to approve them.\n\n"
            "# Output Format\n"
            "The output should be a brief checklist that is no more than 250 words. Each item should be clear and allow the reviewer to quickly note significant clauses, obligations, or potential concerns. Use bullet points and categorise them logically. Avoid excessive details—focus instead on summarising key aspects.\n\n"
            "# Notes\n"
            "Ensure the checklist covers both general and specific concerns that are commonly present in contracts. This checklist is intended to guide reviewers to ensure they don't overlook any significant aspect of a contract.\n\n"
            "Based on the contract details and the identified risky clauses, generate the checklist as specified."
        )

        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout),
                headers={"Authorization": f"Bearer {self.openai_api_key}"},
            ) as session:
                response = await self._call_openai_api_with_backoff(
                    session, system_prompt, user_prompt
                )

                # Extract content based on response type
                if isinstance(response, dict):
                    choices = response.get("choices", [])
                    if not choices:
                        logger.error(
                            "No 'choices' found in the response for summary checklist."
                        )
                        return "Checklist generation failed."

                    message = choices[0].get("message", {})
                    content = message.get("content", "")
                    if not content:
                        logger.error(
                            "No 'content' found in the response for summary checklist."
                        )
                        return "Checklist generation failed."

                elif isinstance(response, str):
                    content = response
                else:
                    logger.error(
                        f"Unexpected response type for summary checklist: {type(response)}"
                    )
                    return "Checklist generation failed."

                # Check if content is JSON or plain text
                # Since the checklist is expected to be bullet points, handle as plain text
                if not self._is_potential_json(content):
                    # Assuming the checklist is in bullet points
                    cleaned_content = self._clean_checklist_content(content)
                else:
                    # If the AI returns JSON, extract the relevant part
                    cleaned_content = self._extract_json_content(content)

                return cleaned_content.strip()

        except Exception as e:
            logger.error(f"Error generating summary checklist: {e}")
            return "Checklist generation failed."

    async def explain_clause_stream(
        self, clause: str, contract_type: ContractType
    ) -> AsyncGenerator[str, None]:
        """
        Stream the explanation for a single clause by sending it to the OpenAI API,
        ensuring that words are correctly separated with spaces.

        Args:
            clause (str): The text of the clause to be explained.
            contract_type (ContractType): The type of the contract (e.g., MSA, NDA).

        Yields:
            str: Properly spaced chunks of the explanation as received from the API.
        """
        system_message = {
            "role": "system",
            "content": self._build_system_message_content(contract_type),
        }
        user_message = {
            "role": "user",
            "content": f"Please provide a straightforward explanation of the following clause:\n\nClause: {clause}",
        }

        buffer = ""  # To store partial words across chunks

        async with aiohttp.ClientSession(
            headers={"Authorization": f"Bearer {self.openai_api_key}"}
        ) as session:
            async with session.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": self.model,
                    "messages": [system_message, user_message],
                    "stream": True,
                    "temperature": self.temperature,
                },
            ) as response:
                if response.status != 200:
                    logger.error(f"Failed to connect to OpenAI API: {response.status}")
                    raise Exception(f"OpenAI API error: {response.status}")

                async for line in response.content:
                    line = line.decode("utf-8").strip()

                    if line.startswith("data: "):
                        line_content = line[len("data: ") :]
                        if line_content == "[DONE]":
                            break

                        try:
                            chunk = json.loads(line_content)
                            content = (
                                chunk.get("choices", [{}])[0]
                                .get("delta", {})
                                .get("content")
                            )
                            if content:
                                # If the buffer has content, append a space if necessary
                                if buffer and not buffer.endswith(" "):
                                    buffer += " "
                                buffer += content  # Add the chunk to the buffer

                                # Yield complete words, leaving any partial word in the buffer
                                words = buffer.split()
                                for word in words[:-1]:
                                    yield word + " "
                                buffer = words[-1]  # Keep the last word in the buffer
                        except json.JSONDecodeError:
                            continue  # Skip invalid JSON chunks

                # Yield any remaining content in the buffer after streaming completes
                if buffer:
                    yield buffer

    ########################################################################
    ############################# HELPER METHODS ###########################
    ########################################################################

    def _get_clause_from_key(self, clauses: List[Clause], key: str) -> str:
        """
        Retrieve the clause content based on the key.

        Args:
            clauses (List[Clause]): A list of clauses to search.
            key (str): The key of the clause to retrieve.

        Returns:
            str: The content of the clause.
        """
        for clause in clauses:
            if clause.key == key:
                return clause.content
        return ""

    def _clean_checklist_content(self, content: str) -> str:
        """
        Clean the checklist content to ensure it adheres to the specified format.

        Args:
            content (str): The raw checklist content from the AI.

        Returns:
            str: The cleaned checklist content.
        """
        # Remove any code block markers or markdown formatting if present
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)
        content = content.strip()
        return content

    def _build_system_prompt(self, contract_type: ContractType) -> str:
        """
        Retrieve the system prompt based on the contract type.

        Args:
            contract_type (ContractType): The type of the contract.

        Returns:
            str: The system prompt tailored to the contract type.
        """
        return self.contract_type_prompts.get(
            contract_type.value.lower(),
            # Default prompt if contract_type not found
            (
                "You are a legal assistant specialized in contract law and risk assessment. "
                "Analyze contract clauses for potential risks such as ambiguity, one-sided terms, "
                "and financial or legal consequences. Provide the analysis in structured JSON format."
            ),
        )

    def _build_user_batch_prompt(self, clauses: List[Clause]) -> str:
        """
        Construct the user prompt for the OpenAI API based on the clauses.

        Args:
            clauses (List[Clause]): A list of clauses to be analyzed.

        Returns:
            str: The constructed user prompt.
        """
        clauses_text = "\n".join(
            [
                f"Clause {idx + 1} (Key: {clause.key}):\n{clause.content}\n"
                for idx, clause in enumerate(clauses)
            ]
        )
        return (
            f"Analyze the following contract clauses:\n\n{clauses_text}\n\n"
            "For each clause, if you identify any risks, provide the following details in a JSON object within a JSON array:\n"
            '- "clause_key": the clause key.\n'
            '- "risk_level": an integer from 1 to 3 indicating the risk level.\n'
            '- "risk_type": one of the following categories: Compliance, Financial, Operational, Strategic, Reputational, Legal.\n'
            '- "risk_factor": one of the following factors: Legal, Financial, Operational.\n'
            '- "title": a brief title summarizing the risk.\n'
            '- "concerns": a brief explanation of the risks.\n'
            '- "recommendations": how to modify the clause to reduce risk.\n\n'
            "If a clause has no identified risks (risk_level 0), you can exclude it from the output.\n"
            "Provide the output strictly as a JSON array of objects without any code block markers, markdown formatting, or additional text.\n"
            'Ensure that all double quotes within string values are properly escaped with a backslash (e.g., \\"Recipient\'s rights\\").\n'
            "Do not escape single quotes.\n\n"
            "Example Output:\n"
            "[\n"
            "    {\n"
            '        "clause_key": "clause-1",\n'
            '        "risk_level": 2,\n'
            '        "risk_type": "Compliance",\n'
            '        "risk_factor": "Legal",\n'
            '        "title": "Ambiguity in Purpose of Confidential Information Disclosure",\n'
            '        "concerns": "The clause lacks specificity in defining the Purpose for disclosing Confidential Information, which may lead to misunderstandings or misuse of the information.",\n'
            '        "recommendations": "Specify the exact purpose for disclosing Confidential Information to ensure clarity and alignment between the parties."\n'
            "    }\n"
            "]"
        )

    def _build_system_message_content(self, contract_type: ContractType) -> str:
        return self.contract_type_prompts_for_explanation.get(
            contract_type.lower(),
            "You are a legal assistant with expertise in contract law. Explain the clause in detail.",
        )

    def _parse_batch_analyzed_clauses(
        self, content: str, clause_key_to_content: Dict[str, str]
    ) -> List[RiskyClause]:
        """
        Parse the JSON content returned by the OpenAI API into a list of RiskyClause instances.

        Args:
            content (str): The JSON content as a string.
            clause_key_to_content (Dict[str, str]): Mapping from clause keys to clause contents.

        Returns:
            List[RiskyClause]: A list of identified risky clauses.
        """
        try:
            content = content.strip()

            # Attempt to fix common JSON issues
            content = self._fix_json_issues(content)

            # Use the standard json library for better error handling
            data = json.loads(content)

            # Ensure the data is a list
            if not isinstance(data, list):
                logger.error(f"Expected a list of clauses, but got: {type(data)}")
                return []

            analyzed_clauses = []
            for clause_data in data:
                try:
                    # Validate that all required fields are present
                    required_fields = [
                        "clause_key",
                        "risk_level",
                        "risk_type",
                        "risk_factor",
                        "title",
                        "concerns",
                        "recommendations",
                    ]
                    if not all(field in clause_data for field in required_fields):
                        missing = [
                            field
                            for field in required_fields
                            if field not in clause_data
                        ]
                        logger.error(
                            f"Missing fields {missing} in clause data: {clause_data}"
                        )
                        continue

                    # Retrieve the clause content using the clause key
                    clause_content = clause_key_to_content.get(
                        clause_data["clause_key"], ""
                    )

                    # Filter out clauses below the risk level threshold
                    risk_level = int(clause_data["risk_level"])
                    if risk_level < self.risk_level_threshold:
                        continue  # Skip clauses that are not risky enough

                    # Additional validation: Ensure types are correct
                    risky_clause = RiskyClause(
                        key=clause_data["clause_key"],
                        content=clause_content,  # Set the actual clause content here
                        risk_level=risk_level,
                        risk_type=str(clause_data["risk_type"]),
                        risk_factor=str(clause_data["risk_factor"]),
                        title=str(clause_data["title"]),
                        concerns=str(clause_data["concerns"]),
                        recommendations=str(clause_data["recommendations"]),
                    )
                    analyzed_clauses.append(risky_clause)
                except KeyError as e:
                    logger.error(f"Missing key {e} in clause data: {clause_data}")
                except Exception as e:
                    logger.error(
                        f"Error parsing clause {clause_data.get('clause_key', 'unknown')}: {e}"
                    )
            return analyzed_clauses
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e} | Content: {content}")
            return []
        except Exception as e:
            logger.error(
                f"Unexpected error during JSON parsing: {e} | Content: {content}"
            )
            return []

    def _extract_json_content(self, content: str) -> str:
        """
        Extract JSON content from the AI's response, ensuring it's a JSON array.

        Args:
            content (str): The raw content from the AI's response.

        Returns:
            str: Cleaned JSON content.
        """
        # Use regex to extract JSON array content
        json_pattern = r"(\[.*\])"
        match = re.search(json_pattern, content, re.DOTALL)
        if match:
            return match.group(1)
        else:
            # If no JSON array is found, log error and return empty string
            logger.error("No JSON array found in the AI response.")
            return ""

    def _fix_json_issues(self, content: str) -> str:
        """
        Clean and fix common JSON formatting issues in the AI's response.

        Args:
            content (str): The raw JSON content.

        Returns:
            str: Cleaned JSON content.
        """
        # Remove any extraneous characters before or after the JSON array
        json_start = content.find("[")
        json_end = content.rfind("]") + 1
        if json_start == -1 or json_end == -1:
            logger.error("JSON array not found in the content.")
            return ""
        content = content[json_start:json_end]

        # Remove trailing commas before closing braces/brackets
        content = re.sub(r",\s*([\]}])", r"\1", content)

        # Handle missing commas between JSON objects
        content = re.sub(r"\}\s*\{", "},{", content)

        # Ensure the content is wrapped in a list if it's not already
        if not content.startswith("["):
            content = f"[{content}]"
        return content

    def _is_potential_json(self, content: str) -> bool:
        """
        Check if the content potentially contains JSON.

        Args:
            content (str): The content to check.

        Returns:
            bool: True if content is likely JSON, False otherwise.
        """
        content = content.strip()
        return (content.startswith("[") and content.endswith("]")) or (
            content.startswith("{") and content.endswith("}")
        )
