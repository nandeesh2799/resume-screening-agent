"""Unit tests for the scoring module."""
import pytest
from backend.core.scorer import (
    _skill_overlap_score,
    _experience_match_score,
    _tfidf_similarity,
    _extract_required_experience,
    score_candidate,
)


def test_skill_overlap_perfect():
    score, matched, missing = _skill_overlap_score(
        ["python", "react", "docker"],
        ["python", "react", "docker", "kubernetes"],
    )
    assert score == 100.0
    assert set(matched) == {"python", "react", "docker"}
    assert missing == []


def test_skill_overlap_partial():
    score, matched, missing = _skill_overlap_score(
        ["python", "react", "docker", "aws"],
        ["python", "docker"],
    )
    assert score == 50.0
    assert len(matched) == 2
    assert len(missing) == 2


def test_skill_overlap_none():
    score, matched, missing = _skill_overlap_score(
        ["python", "react"],
        ["java", "angular"],
    )
    assert score == 0.0
    assert matched == []


def test_skill_overlap_empty_jd():
    score, matched, missing = _skill_overlap_score([], ["python"])
    assert score == 50.0  # neutral


def test_experience_match_above_required():
    score = _experience_match_score(8.0, 5.0)
    assert score >= 90.0


def test_experience_match_exact():
    score = _experience_match_score(5.0, 5.0)
    assert score >= 90.0


def test_experience_match_below_required():
    score = _experience_match_score(2.0, 5.0)
    assert score < 50.0


def test_experience_match_unknown():
    score = _experience_match_score(None, 5.0)
    assert score == 40.0


def test_extract_required_experience():
    jd = "We require at least 5 years of experience in software development."
    assert _extract_required_experience(jd) == 5.0


def test_extract_required_experience_default():
    jd = "We are looking for a motivated developer to join our team."
    # Should return the default
    assert _extract_required_experience(jd) == 5.0


def test_tfidf_similarity_identical():
    sim = _tfidf_similarity("hello world python", "hello world python")
    assert sim >= 0.99


def test_tfidf_similarity_different():
    sim = _tfidf_similarity("python machine learning ai", "cooking baking recipes food")
    assert sim < 0.3


def test_score_candidate_structure():
    jd = "Looking for a Python developer with 3 years experience in FastAPI and Docker."
    candidate = {
        "filename": "test.txt",
        "name": "Alice Smith",
        "skills": ["python", "fastapi", "docker"],
        "years_of_experience": 4.0,
        "raw_text": "Experienced Python developer with FastAPI and Docker skills.",
    }
    result = score_candidate(jd, candidate)
    assert "scores" in result
    assert "explanation" in result
    scores = result["scores"]
    assert 0 <= scores["final_score"] <= 100
    assert 0 <= scores["semantic_similarity"] <= 100
    assert 0 <= scores["skill_overlap"] <= 100
    assert 0 <= scores["experience_match"] <= 100


def test_score_candidate_high_scorer():
    jd = "Senior Python engineer with FastAPI, Docker, AWS, PostgreSQL. 5 years experience."
    candidate = {
        "filename": "senior.txt",
        "name": "Bob Lee",
        "skills": ["python", "fastapi", "docker", "aws", "postgresql"],
        "years_of_experience": 7.0,
        "raw_text": "Senior Python software engineer. Extensive FastAPI, Docker, AWS, PostgreSQL experience. 7 years in backend development.",
    }
    result = score_candidate(jd, candidate)
    assert result["scores"]["final_score"] >= 60


def test_score_candidate_low_scorer():
    jd = "Machine learning engineer with TensorFlow, PyTorch. PhD required."
    candidate = {
        "filename": "mismatch.txt",
        "name": "Carol White",
        "skills": ["html", "css", "photoshop"],
        "years_of_experience": 1.0,
        "raw_text": "Graphic designer skilled in HTML, CSS and Photoshop. 1 year experience.",
    }
    result = score_candidate(jd, candidate)
    assert result["scores"]["final_score"] < 60
