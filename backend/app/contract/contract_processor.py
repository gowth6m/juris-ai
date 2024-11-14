import os
import tempfile

import convertapi
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader

from app.contract.contract_models import Clause


class ContractProcessor:
    """
    Static class to process contracts and extract clauses.

    - parse_pdf_to_html: Convert a PDF file to HTML.
    - convert_pdf_to_html: Convert a PDF file to HTML and return the number of pages.
    - mark_clauses: Mark clauses in the HTML content.
    - get_number_of_pages: Get the number of pages in a PDF file.
    """

    @staticmethod
    def parse_pdf_to_html(file_path: str) -> str:
        result = convertapi.convert(
            "html", {"File": file_path, "Wysiwyg": "false"}, from_format="pdf"
        )
        return result.file.io.getvalue().decode("utf-8")

    @staticmethod
    def convert_pdf_to_html(file: bytes) -> tuple[str, int]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(file)
            temp_pdf_path = temp_pdf.name

        try:
            html = ContractProcessor.parse_pdf_to_html(temp_pdf_path)
            pages = ContractProcessor.get_number_of_pages(temp_pdf_path)
        finally:
            os.unlink(temp_pdf_path)

        return html, pages

    @staticmethod
    def mark_clauses(html: str) -> tuple[str, list[Clause]]:
        soup = BeautifulSoup(html, "html.parser")
        clauses = []

        for clause_counter, li in enumerate(
            soup.find_all("li", recursive=True), start=1
        ):
            if li.get_text(strip=True):
                li["data-is-clause"] = "true"
                li["data-location"] = "section"
                li["data-clause-id"] = f"clause-{clause_counter}"
                clauses.append(
                    Clause(
                        key=f"clause-{clause_counter}",
                        content=li.get_text(strip=True),
                        location=li["data-location"],
                    )
                )

        return str(soup), clauses

    @staticmethod
    def get_number_of_pages(file_path: str) -> int:
        with open(file_path, "rb") as file:
            reader = PdfReader(file)
            return len(reader.pages)
