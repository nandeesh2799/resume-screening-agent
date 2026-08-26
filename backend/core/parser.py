"""
Resume parsing module.
Handles PDF (via pdfplumber), DOCX (via python-docx), and plain TXT files.
Extracts: name, email, phone, skills, years of experience, education, raw text.
"""
from __future__ import annotations

import io
import re
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Skill vocabulary (extend as needed)
# ---------------------------------------------------------------------------
SKILL_KEYWORDS: list[str] = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "bash", "shell",
    # Web
    "react", "vue", "angular", "nextjs", "nuxt", "svelte", "html", "css",
    "tailwind", "bootstrap", "graphql", "rest", "fastapi", "django", "flask",
    "express", "node", "nodejs", "spring", "asp.net",
    # Data / ML / AI
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "spark", "hadoop", "kafka", "airflow",
    "transformers", "llm", "gpt", "bert", "langchain", "rag",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible",
    "ci/cd", "github actions", "jenkins", "linux", "git",
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "cassandra", "sqlite", "snowflake", "bigquery", "dbt",
    # Soft / Domain
    "agile", "scrum", "product management", "data analysis",
    "communication", "leadership", "team management",
]

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "b.sc", "m.sc", "b.tech", "m.tech",
    "b.e.", "m.e.", "mba", "b.com", "mca", "bca", "diploma",
    "university", "college", "institute", "school of",
]

EXPERIENCE_PATTERNS = [
    re.compile(
        r"(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp)",
        re.IGNORECASE,
    ),
    re.compile(
        r"experience\s*[:–-]?\s*(\d+(?:\.\d+)?)\s*\+?\s*years?",
        re.IGNORECASE,
    ),
]

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(
    r"(?:\+?\d[\d\s\-().]{7,15}\d)"
)


# ---------------------------------------------------------------------------
# Low-level extractors
# ---------------------------------------------------------------------------

def _extract_from_txt(content: str) -> str:
    """Return raw text from plain-text content."""
    return content


def _extract_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    try:
        import pdfplumber  # type: ignore

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages)
    except Exception as exc:
        logger.warning("pdfplumber failed, falling back to pypdf: %s", exc)
        # Fallback to pypdf
        from pypdf import PdfReader  # type: ignore

        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(
            page.extract_text() or "" for page in reader.pages
        )


def _extract_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    from docx import Document  # type: ignore

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs]
    # Also extract tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                paragraphs.append(cell.text)
    return "\n".join(paragraphs)


# ---------------------------------------------------------------------------
# NLP helpers
# ---------------------------------------------------------------------------

def _extract_name(text: str) -> Optional[str]:
    """
    Heuristic: the candidate name is usually on one of the first 5 lines,
    all-caps or Title Case, and doesn't look like a section heading.
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()][:8]
    for line in lines:
        # Skip lines that look like headings or contact info
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if any(kw in line.lower() for kw in ["resume", "curriculum", "cv", "objective", "summary"]):
            continue
        # Accept 2-4 word title-case or all-caps line
        words = line.split()
        if 2 <= len(words) <= 4 and all(
            w[0].isupper() or w.isupper() for w in words if w.isalpha()
        ):
            return line
    return None


def _extract_email(text: str) -> Optional[str]:
    match = EMAIL_RE.search(text)
    return match.group(0) if match else None


def _extract_phone(text: str) -> Optional[str]:
    match = PHONE_RE.search(text)
    return match.group(0).strip() if match else None


def _extract_skills(text: str) -> list[str]:
    lower = text.lower()
    found: list[str] = []
    for skill in SKILL_KEYWORDS:
        # Use word-boundary matching for single-word skills
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, lower):
            found.append(skill)
    return list(dict.fromkeys(found))  # preserve order, deduplicate


def _extract_years_experience(text: str) -> Optional[float]:
    for pattern in EXPERIENCE_PATTERNS:
        match = pattern.search(text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
    # Fallback: count date ranges like "2018 - 2022"
    year_ranges = re.findall(
        r"\b(19|20)\d{2}\b\s*[-–]\s*\b(?:(19|20)\d{2}|present|current)\b",
        text,
        re.IGNORECASE,
    )
    if year_ranges:
        # rough estimate: number of distinct roles × 2 years
        return min(float(len(year_ranges)) * 2.0, 20.0)
    return None


def _extract_education(text: str) -> list[str]:
    lines = text.splitlines()
    edu: list[str] = []
    for line in lines:
        lower = line.lower()
        if any(kw in lower for kw in EDUCATION_KEYWORDS):
            stripped = line.strip()
            if stripped and len(stripped) > 4:
                edu.append(stripped)
    return edu[:5]  # cap at 5 entries


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_resume(filename: str, file_bytes: bytes) -> dict:
    """
    Parse a resume file and return a dict matching ExtractedCandidate fields.
    Raises ValueError on unrecognised format; caller should catch and flag.
    """
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        raw_text = _extract_from_pdf(file_bytes)
    elif suffix in (".docx", ".doc"):
        raw_text = _extract_from_docx(file_bytes)
    elif suffix == ".txt":
        raw_text = file_bytes.decode("utf-8", errors="replace")
        raw_text = _extract_from_txt(raw_text)
    else:
        raise ValueError(f"Unsupported file format: {suffix!r}")

    if not raw_text.strip():
        raise ValueError("Could not extract any text from the file")

    return {
        "filename": filename,
        "name": _extract_name(raw_text),
        "email": _extract_email(raw_text),
        "phone": _extract_phone(raw_text),
        "skills": _extract_skills(raw_text),
        "years_of_experience": _extract_years_experience(raw_text),
        "education": _extract_education(raw_text),
        "raw_text": raw_text,
        "parse_error": None,
    }
