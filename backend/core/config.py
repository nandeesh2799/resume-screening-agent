"""
Centralized configuration for the Resume Screening Agent.
Loaded from environment variables with robust defaults.
"""
import os
from pathlib import Path
from typing import Set

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
SAMPLE_RESUMES_DIR = BASE_DIR / "sample_resumes"
SAMPLE_JD_FILE = BASE_DIR / "sample_jd.txt"
OUTPUTS_DIR = BASE_DIR / "sample_output"

# Application Metadata
PROJECT_NAME: str = "ResumeRank AI"
VERSION: str = "1.0.0"
DESCRIPTION: str = "Production-grade autonomous resume screening and semantic ranking engine."

# Server Config
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*",
]

# File Processing Constraints
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
ALLOWED_EXTENSIONS: Set[str] = {".pdf", ".docx", ".doc", ".txt"}

# NLP & Machine Learning Engine
EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
WEIGHT_SEMANTIC: float = float(os.getenv("WEIGHT_SEMANTIC", "0.45"))
WEIGHT_SKILLS: float = float(os.getenv("WEIGHT_SKILLS", "0.35"))
WEIGHT_EXPERIENCE: float = float(os.getenv("WEIGHT_EXPERIENCE", "0.20"))

# Validation
assert abs((WEIGHT_SEMANTIC + WEIGHT_SKILLS + WEIGHT_EXPERIENCE) - 1.0) < 1e-4, \
    "Scoring weights must sum to 1.0 (currently: " \
    f"{WEIGHT_SEMANTIC + WEIGHT_SKILLS + WEIGHT_EXPERIENCE})"
