"""
Screening Service orchestrates parsing, scoring, ranking, and error recovery.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import AsyncGenerator

from backend.core import config
from backend.core.parser import parse_resume
from backend.core.scorer import _extract_jd_skills, _extract_required_experience, score_candidate
from backend.models.schemas import (
    ExtractedCandidate,
    ScoreBreakdown,
    ScoredCandidate,
    ScreeningResult,
)

logger = logging.getLogger(__name__)


class ScreeningService:
    """Service coordinating resume parsing, feature extraction, and candidate scoring."""

    @staticmethod
    def process_single_resume(
        filename: str,
        file_bytes: bytes,
        jd_text: str,
        jd_skills: list[str],
        required_years: float,
    ) -> tuple[ScoredCandidate | None, dict | None]:
        """
        Parse and score a single resume.
        Returns (ScoredCandidate, None) on success or (None, error_dict) on failure.
        """
        suffix = Path(filename).suffix.lower()
        if suffix not in config.ALLOWED_EXTENSIONS:
            return None, {
                "filename": filename,
                "reason": f"Unsupported file extension {suffix!r}. Supported: {', '.join(sorted(config.ALLOWED_EXTENSIONS))}",
            }

        try:
            parsed = parse_resume(filename, file_bytes)
        except Exception as exc:
            logger.warning("Parse failure for %s: %s", filename, exc)
            return None, {"filename": filename, "reason": str(exc)}

        try:
            result = score_candidate(
                jd_text,
                parsed,
                jd_skills=jd_skills,
                required_years=required_years,
            )
        except Exception as exc:
            logger.warning("Scoring failure for %s: %s", filename, exc)
            return None, {"filename": filename, "reason": f"Scoring failed: {exc}"}

        candidate = ExtractedCandidate(**parsed)
        scored = ScoredCandidate(
            candidate=candidate,
            scores=ScoreBreakdown(**result["scores"]),
            rank=0,  # Ranked in batch aggregation
            explanation=result["explanation"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
        )
        return scored, None

    @classmethod
    def get_sample_files(cls) -> list[dict]:
        """List all sample resumes on the server with metadata."""
        sample_files = []
        if config.SAMPLE_RESUMES_DIR.exists():
            for p in sorted(config.SAMPLE_RESUMES_DIR.iterdir()):
                if p.suffix.lower() in config.ALLOWED_EXTENSIONS:
                    sample_files.append({
                        "filename": p.name,
                        "size_kb": round(p.stat().st_size / 1024, 1),
                        "extension": p.suffix.lower(),
                    })
        return sample_files
