import re
from io import BytesIO
from typing import List

import pdfplumber
from bs4 import BeautifulSoup

from app.contract.contract_models import Clause


def convert_pdf_to_html(pdf_content: bytes) -> str:
    """
    Convert a PDF file's content to an HTML string with clause identification in <li> tags,
    excluding the clause identifier from the content.

    Args:
        pdf_content (bytes): The content of the PDF file as bytes.

    Returns:
        str: The HTML representation of the PDF content with clause identifiers.
    """
    html_content = "<html><body>"
    clause_pattern = re.compile(
        r"^(\d+\.\d+(?:\.\d+)?)\s*-?\s*(.*)"
    )  # Matches 1.1, 1.2, 1.1.1 with optional space or dash

    with pdfplumber.open(BytesIO(pdf_content)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text:
                html_content += f"<h3>Page {page_num}</h3><ul>"
                lines = text.splitlines()
                accumulating_content = None
                current_clause_id = None

                for line in lines:
                    line = line.strip()
                    match = clause_pattern.match(line)

                    if match:
                        # Append the accumulated clause content to HTML if present
                        if current_clause_id and accumulating_content:
                            html_content += f'<li data-clause-id="{current_clause_id}">{accumulating_content.strip()}</li>'

                        # Start a new clause
                        current_clause_id = match.group(1)
                        accumulating_content = match.group(2)
                    elif accumulating_content is not None:
                        # Accumulate lines within the same clause
                        accumulating_content += " " + line
                    else:
                        # Add regular paragraph if not a clause
                        html_content += f"<p>{line}</p>"

                # Append the last accumulated clause content
                if current_clause_id and accumulating_content:
                    html_content += f'<li data-clause-id="{current_clause_id}">{accumulating_content.strip()}</li>'

                html_content += "</ul>"
            else:
                html_content += (
                    f"<h3>Page {page_num}</h3><p>No text found on this page.</p>"
                )

    html_content += "</body></html>"
    return html_content


def identify_clauses_in_html(html_content: str) -> List[Clause]:
    """
    Process HTML content to identify clauses in <li> elements with data-clause-id attributes.

    Args:
        html_content (str): The HTML content of the contract.

    Returns:
        List[Clause]: A list of Clause objects with clause IDs and content.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    clauses = []

    for li_tag in soup.find_all("li", {"data-clause-id": True}):
        clause_id = li_tag.get("data-clause-id")
        content = li_tag.get_text(strip=True)
        if clause_id and content:
            clauses.append(Clause(key=clause_id, content=content))

    return clauses


def extract_text_from_pdf(pdf_content: bytes) -> List[str]:
    """
    Extracts text content from each page of a PDF.

    Args:
        pdf_content (bytes): The content of the PDF file as bytes.

    Returns:
        List[str]: A list of strings where each string is the text of a page.
    """
    text_pages = []
    with pdfplumber.open(BytesIO(pdf_content)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            text_pages.append(text if text else "No text found on this page.")
    return text_pages
