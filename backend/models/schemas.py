"""Pydantic models for the Resume Screening Agent."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class ExtractedCandidate(BaseModel):
    """Structured data extracted from a single resume."""

    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    years_of_experience: Optional[float] = None
    education: list[str] = Field(default_factory=list)
    raw_text: str = ""
    parse_error: Optional[str] = None  # set when parsing fails


class ScoreBreakdown(BaseModel):
    """Sub-scores that make up the final relevance score."""

    semantic_similarity: float = Field(ge=0, le=100)
    skill_overlap: float = Field(ge=0, le=100)
    experience_match: float = Field(ge=0, le=100)
    final_score: float = Field(ge=0, le=100)


class ScoredCandidate(BaseModel):
    """A candidate with scoring, deterministic explanation, and optional LLM critique."""

    candidate: ExtractedCandidate
    scores: ScoreBreakdown
    rank: int
    explanation: str
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    llm_critique: Optional[str] = None


class ScreeningResult(BaseModel):
    """Full result of a screening run."""

    job_description_preview: str
    total_processed: int
    total_failed: int
    candidates: list[ScoredCandidate]
    failed_files: list[dict[str, str]] = Field(default_factory=list)
