"""Unit tests for the resume parser."""
import pytest
from backend.core.parser import (
    _extract_email,
    _extract_name,
    _extract_phone,
    _extract_skills,
    _extract_years_experience,
    _extract_education,
    parse_resume,
)

SAMPLE_TEXT = """
John Doe
john.doe@example.com | +1-555-123-4567

Senior Software Engineer — 7 years of experience

Skills: Python, FastAPI, React, TypeScript, Docker, AWS, PostgreSQL

Education:
Bachelor of Science in Computer Science, MIT, 2014
Master of Science in Software Engineering, Stanford, 2016
"""


def test_extract_email():
    assert _extract_email(SAMPLE_TEXT) == "john.doe@example.com"


def test_extract_phone():
    phone = _extract_phone(SAMPLE_TEXT)
    assert phone is not None
    assert "555" in phone


def test_extract_skills():
    skills = _extract_skills(SAMPLE_TEXT)
    assert "python" in skills
    assert "react" in skills
    assert "docker" in skills
    assert "aws" in skills


def test_extract_years_experience():
    years = _extract_years_experience(SAMPLE_TEXT)
    assert years == 7.0


def test_extract_education():
    edu = _extract_education(SAMPLE_TEXT)
    assert any("bachelor" in e.lower() or "master" in e.lower() for e in edu)


def test_extract_name():
    name = _extract_name(SAMPLE_TEXT)
    assert name is not None
    assert "Doe" in name or "John" in name


def test_parse_resume_txt():
    content = SAMPLE_TEXT.encode("utf-8")
    result = parse_resume("resume.txt", content)
    assert result["parse_error"] is None
    assert "python" in result["skills"]
    assert result["years_of_experience"] == 7.0


def test_parse_resume_unsupported_format():
    with pytest.raises(ValueError, match="Unsupported"):
        parse_resume("resume.xyz", b"content")


def test_parse_resume_empty_file():
    with pytest.raises(ValueError, match="Could not extract"):
        parse_resume("resume.txt", b"   \n  ")
