"""Unit tests for the LLM qualitative critique module."""
import os
from unittest.mock import patch, MagicMock

import pytest

from backend.core.llm_critique import (
    RECRUITER_SYSTEM_PROMPT,
    generate_llm_critique,
)
from backend.services.screening_service import ScreeningService

MOCK_JD = "Senior Full Stack Engineer proficient in Python, React, PostgreSQL, Docker, AWS. 5+ years experience required."
MOCK_CANDIDATE = {
    "filename": "john_doe.txt",
    "name": "John Doe",
    "skills": ["python", "react", "postgresql", "docker", "aws"],
    "years_of_experience": 6.0,
    "education": ["B.Sc. Computer Science"],
    "raw_text": "John Doe. Senior Software Engineer with 6 years experience in Python, React, PostgreSQL, Docker, and AWS.",
}
MOCK_SCORES = {
    "semantic_similarity": 82.0,
    "skill_overlap": 90.0,
    "experience_match": 100.0,
    "final_score": 88.4,
}


def test_system_prompt_structure():
    """Verify that the explicit system prompt is defined with recruiter instructions."""
    assert RECRUITER_SYSTEM_PROMPT is not None
    assert "expert technical recruiter" in RECRUITER_SYSTEM_PROMPT
    assert "executive summary" in RECRUITER_SYSTEM_PROMPT.lower()
    assert "Never invent skills" in RECRUITER_SYSTEM_PROMPT


def test_llm_critique_fallback_when_no_api_key(monkeypatch):
    """Confirm graceful offline fallback returns None when no API key is set."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    critique = generate_llm_critique(
        jd_text=MOCK_JD,
        candidate_dict=MOCK_CANDIDATE,
        scores_dict=MOCK_SCORES,
        matched_skills=["python", "react", "postgresql"],
        missing_skills=[],
    )
    assert critique is None


def test_llm_critique_success_with_gemini_key(monkeypatch):
    """Confirm critique is generated and returned when GEMINI_API_KEY is configured."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-mock-gemini-key")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    mock_critique_text = (
        "John Doe is a strong candidate with 6 years of relevant full stack experience. "
        "Strengths include verified hands-on depth in Python and PostgreSQL matching core infrastructure. "
        "The recruiter should probe depth in large-scale distributed cloud architecture during the technical interview."
    )

    with patch("backend.core.llm_critique._call_gemini_api", return_value=mock_critique_text) as mock_call:
        critique = generate_llm_critique(
            jd_text=MOCK_JD,
            candidate_dict=MOCK_CANDIDATE,
            scores_dict=MOCK_SCORES,
            matched_skills=["python", "react", "postgresql"],
            missing_skills=[],
        )
        assert critique == mock_critique_text
        mock_call.assert_called_once()


def test_screening_service_attaches_llm_critique(monkeypatch):
    """Confirm ScreeningService attaches llm_critique to the ScoredCandidate object."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-mock-gemini-key")

    mock_critique = "Excellent fit for Senior Full Stack role with verified Python and AWS experience."

    with patch("backend.core.llm_critique._call_gemini_api", return_value=mock_critique):
        scored, error = ScreeningService.process_single_resume(
            filename="john_doe.txt",
            file_bytes=MOCK_CANDIDATE["raw_text"].encode("utf-8"),
            jd_text=MOCK_JD,
            jd_skills=["python", "react", "postgresql", "docker", "aws"],
            required_years=5.0,
        )

        assert error is None
        assert scored is not None
        assert scored.llm_critique == mock_critique
        assert scored.scores.final_score > 0
        assert scored.explanation is not None
