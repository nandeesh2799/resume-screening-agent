"""
Multi-format resume parser supporting PDF, DOCX, and TXT files.
Extracts structured candidate metadata: Name, Email, Phone, Skills, Education, and Experience.
Includes skill alias/synonym normalization.
"""
from __future__ import annotations

import io
import re
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Skill Keyword Taxonomy & Synonyms
# ---------------------------------------------------------------------------

SKILL_ALIASES: dict[str, str] = {
    "postgres": "postgresql",
    "psql": "postgresql",
    "postgresql": "postgresql",
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "kubernetes": "kubernetes",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure": "azure",
    "microsoft azure": "azure",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "react native": "react native",
    "ts": "typescript",
    "typescript": "typescript",
    "js": "javascript",
    "javascript": "javascript",
    "py": "python",
    "python": "python",
    "tf": "tensorflow",
    "tensorflow": "tensorflow",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "nlp": "nlp",
    "natural language processing": "nlp",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "continuous integration": "ci/cd",
    "golang": "go",
    "go": "go",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "fastapi": "fastapi",
    "django": "django",
    "flask": "flask",
    "redis": "redis",
    "kafka": "kafka",
    "apache kafka": "kafka",
    "spark": "spark",
    "apache spark": "spark",
    "airflow": "airflow",
    "apache airflow": "airflow",
    "docker": "docker",
    "terraform": "terraform",
    "ansible": "ansible",
    "graphql": "graphql",
    "rest": "rest api",
    "rest api": "rest api",
    "microservices": "microservices",
    "pytorch": "pytorch",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "numpy",
    "git": "git",
    "github": "git",
    "sql": "sql",
    "nosql": "nosql",
    "linux": "linux",
    "bash": "bash",
    "prometheus": "prometheus",
    "grafana": "grafana",
    "snowflake": "snowflake",
    "bigquery": "bigquery",
    "dbt": "dbt",
    "llm": "llm",
    "rag": "rag",
    "langchain": "langchain",
    "llamaindex": "llamaindex",
}

SKILL_KEYWORDS: list[str] = sorted(list(set(SKILL_ALIASES.values())))


# ---------------------------------------------------------------------------
# Regex Patterns
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    re.IGNORECASE,
)

PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}",
)

YEARS_EXP_RE = re.compile(
    r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?",
    re.IGNORECASE,
)

DATE_RANGE_RE = re.compile(
    r"\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2}|present|current)\b",
    re.IGNORECASE,
)

EDUCATION_KEYWORDS = [
    "ph.d", "phd", "master of science", "master of arts", "bachelor of science",
    "bachelor of arts", "bachelor of technology", "bachelor of engineering",
    "master of technology", "master of engineering", "m.s.", "m.a.", "b.s.", "b.a.",
    "b.tech", "m.tech", "b.e.", "m.e.", "mba", "master's", "bachelor's", "degree",
    "computer science", "data science", "information technology", "electrical engineering",
    "mathematics", "statistics", "software engineering",
]


# ---------------------------------------------------------------------------
# Text Extraction Functions
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using pdfplumber with pypdf fallback."""
    text_parts: list[str] = []

    try:
        import pdfplumber  # type: ignore
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
    except Exception:
        pass

    if not text_parts:
        try:
            import pypdf  # type: ignore
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        except Exception:
            pass

    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    try:
        import docx  # type: ignore
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
        return "\n".join(paragraphs).strip()
    except Exception as exc:
        raise ValueError(f"Failed to extract text from DOCX: {exc}") from exc


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Decode plain text bytes with UTF-8 / Latin-1 fallback."""
    for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            return file_bytes.decode(enc).strip()
        except UnicodeDecodeError:
            continue
    return file_bytes.decode("utf-8", errors="replace").strip()


# ---------------------------------------------------------------------------
# Entity Extraction Functions
# ---------------------------------------------------------------------------

def _extract_email(text: str) -> Optional[str]:
    m = EMAIL_RE.search(text)
    return m.group(0).strip() if m else None


def _extract_phone(text: str) -> Optional[str]:
    m = PHONE_RE.search(text)
    return m.group(0).strip() if m else None


def _extract_skills(text: str) -> list[str]:
    """Scan text for skill keywords and synonyms with word boundaries."""
    found: set[str] = set()
    text_lower = text.lower()

    for raw_skill, canonical in SKILL_ALIASES.items():
        pattern = r"(?<!\w)" + re.escape(raw_skill) + r"(?!\w)"
        if re.search(pattern, text_lower):
            found.add(canonical)

    return sorted(list(found))


def _extract_years_experience(text: str) -> Optional[float]:
    """
    Extract years of experience.
    1. Check explicit "X years of experience" statements.
    2. Fall back to parsing employment date ranges.
    """
    matches = YEARS_EXP_RE.findall(text)
    if matches:
        try:
            return max(float(m) for m in matches)
        except ValueError:
            pass

    # Date range heuristic
    date_matches = DATE_RANGE_RE.findall(text)
    if date_matches:
        import datetime
        current_year = datetime.datetime.now().year
        total_span = 0
        for start_str, end_str in date_matches:
            try:
                start = int(start_str)
                end = current_year if end_str.lower() in ("present", "current") else int(end_str)
                if 1970 <= start <= current_year and start <= end <= current_year + 1:
                    total_span += (end - start)
            except ValueError:
                continue
        if total_span > 0:
            return float(min(total_span, 40))

    return None


def _extract_education(text: str) -> list[str]:
    """Extract education degree mentions and institutions."""
    found: list[str] = []
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        line_lower = line_clean.lower()
        if any(kw in line_lower for kw in EDUCATION_KEYWORDS):
            if len(line_clean) < 120 and line_clean not in found:
                found.append(line_clean)
    return found[:5]


def _extract_name(text: str, filename: str = "") -> Optional[str]:
    """Extract candidate name from header lines or fallback to filename."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:5]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if any(kw in line.lower() for kw in ("resume", "curriculum vitae", "cv", "page", "profile", "contact", "summary")):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w and w[0].isalpha()):
            return line

    if filename:
        stem = Path(filename).stem
        clean_stem = re.sub(r"^[\d_-]+", "", stem)
        parts = [p.capitalize() for p in re.split(r"[_\s-]+", clean_stem) if p and not p.isdigit()]
        return " ".join(parts) if parts else None
    return None


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

def parse_resume(filename: str, file_bytes: bytes) -> dict:
    """
    Parse a single resume file.
    Raises ValueError for unsupported formats or empty unreadable files.
    """
    suffix = Path(filename).suffix.lower()

    if suffix not in (".pdf", ".docx", ".doc", ".txt"):
        raise ValueError(f"Unsupported file format: {suffix}")

    if not file_bytes or not file_bytes.strip():
        raise ValueError("Could not extract readable text from empty file (0 bytes).")

    raw_text = ""
    if suffix == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif suffix in (".docx", ".doc"):
        raw_text = extract_text_from_docx(file_bytes)
    elif suffix == ".txt":
        raw_text = extract_text_from_txt(file_bytes)

    if not raw_text or not raw_text.strip():
        raise ValueError("Could not extract readable text from file.")

    return {
        "filename": filename,
        "name": _extract_name(raw_text, filename),
        "email": _extract_email(raw_text),
        "phone": _extract_phone(raw_text),
        "skills": _extract_skills(raw_text),
        "years_of_experience": _extract_years_experience(raw_text),
        "education": _extract_education(raw_text),
        "raw_text": raw_text,
        "parse_error": None,
    }
