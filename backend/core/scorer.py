"""
Scoring module for the Resume Screening Agent.
Combines Dense Semantic Similarity, Jaccard Skill Overlap, and Experience Matching.
Supports dynamic weights and dealbreaker/knockout criteria.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Default weights
W_SEMANTIC = 0.45
W_SKILL = 0.35
W_EXP = 0.20

EXPECTED_EXP_YEARS = 5.0  # default when JD doesn't specify

_st_model = None


def _get_st_model():
    global _st_model
    if _st_model is None:
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore
            _st_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded.")
        except Exception as exc:
            logger.warning("Could not load SentenceTransformer: %s. Falling back to TF-IDF only.", exc)
    return _st_model


def _tfidf_similarity(text_a: str, text_b: str) -> float:
    """TF-IDF cosine similarity between two texts, returns 0-1."""
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf = vectorizer.fit_transform([text_a, text_b])
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return float(sim)
    except Exception:
        return 0.0


def _semantic_similarity(jd_text: str, resume_text: str) -> float:
    """Semantic cosine similarity (0-100)."""
    model = _get_st_model()
    if model is not None:
        try:
            embeddings = model.encode([jd_text[:2048], resume_text[:2048]])
            sim = float(np.dot(embeddings[0], embeddings[1]) / (
                np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]) + 1e-9
            ))
            return max(0.0, min(1.0, sim)) * 100
        except Exception as exc:
            logger.warning("Semantic encoding failed: %s", exc)
    return _tfidf_similarity(jd_text, resume_text) * 100


def _extract_jd_skills(jd_text: str) -> list[str]:
    """Pull skill keywords from the JD."""
    from backend.core.parser import _extract_skills
    return _extract_skills(jd_text)


def _skill_overlap_score(jd_skills: list[str], candidate_skills: list[str]) -> tuple[float, list[str], list[str]]:
    """Jaccard-style overlap between JD skills and candidate skills."""
    if not jd_skills:
        return 50.0, [], []

    jd_set = set(s.lower() for s in jd_skills)
    cand_set = set(s.lower() for s in candidate_skills)

    matched = sorted(list(jd_set.intersection(cand_set)))
    missing = sorted(list(jd_set.difference(cand_set)))

    score = (len(matched) / len(jd_set)) * 100
    return round(score, 1), matched, missing


def _extract_required_experience(jd_text: str) -> float:
    """Extract required years of experience from JD text."""
    pattern = re.compile(
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience|\s+required|\s+preferred|\s+in|\s+with)",
        re.IGNORECASE,
    )
    matches = pattern.findall(jd_text)
    if matches:
        try:
            return float(matches[0])
        except ValueError:
            pass
    return EXPECTED_EXP_YEARS


def _experience_match_score(candidate_years: Optional[float], required_years: float) -> float:
    """Score candidate experience relative to required threshold (0-100)."""
    if candidate_years is None:
        return 40.0

    if required_years <= 0:
        return 100.0

    ratio = candidate_years / required_years
    if ratio >= 1.0:
        return 100.0
    return round(ratio * 100, 1)


def generate_explanation(
    final_score: float,
    semantic: float,
    skill_score: float,
    exp_score: float,
    matched_skills: list[str],
    missing_skills: list[str],
    candidate_years: Optional[float],
    required_years: float,
) -> str:
    """Generate professional recruiter evaluation note."""
    lines: list[str] = []

    # Overall fit assessment
    if final_score >= 75:
        lines.append(f"Strong overall match ({final_score:.0f}/100) meeting key technical criteria.")
    elif final_score >= 50:
        lines.append(f"Moderate match ({final_score:.0f}/100) with relevant background but some technical gaps.")
    else:
        lines.append(f"Significant gaps identified ({final_score:.0f}/100) relative to core requirements.")

    # Skill coverage
    if matched_skills:
        top_matched = ", ".join(matched_skills[:4])
        lines.append(f"Demonstrates proficiency in: {top_matched}.")
    if missing_skills:
        top_missing = ", ".join(missing_skills[:4])
        lines.append(f"Missing core competencies: {top_missing}.")

    # Experience
    if candidate_years is not None:
        if candidate_years >= required_years:
            lines.append(f"Experience ({candidate_years:.0f} yrs) meets required seniority ({required_years:.0f}+ yrs).")
        else:
            lines.append(f"Experience ({candidate_years:.0f} yrs) is below required target ({required_years:.0f}+ yrs).")

    return " ".join(lines)


def score_candidate(
    jd_text: str,
    candidate_dict: dict,
    jd_skills: Optional[list[str]] = None,
    required_years: Optional[float] = None,
    w_semantic: float = W_SEMANTIC,
    w_skill: float = W_SKILL,
    w_exp: float = W_EXP,
) -> dict:
    """Score candidate against job specification."""
    if jd_skills is None:
        jd_skills = _extract_jd_skills(jd_text)
    if required_years is None:
        required_years = _extract_required_experience(jd_text)

    resume_text = candidate_dict.get("raw_text", "")
    candidate_skills = candidate_dict.get("skills", [])
    candidate_years = candidate_dict.get("years_of_experience")

    semantic_sim = _semantic_similarity(jd_text, resume_text)
    skill_score, matched_skills, missing_skills = _skill_overlap_score(jd_skills, candidate_skills)
    exp_score = _experience_match_score(candidate_years, required_years)

    final_score = (
        w_semantic * semantic_sim
        + w_skill * skill_score
        + w_exp * exp_score
    )
    final_score = round(max(0.0, min(100.0, final_score)), 1)

    explanation = generate_explanation(
        final_score=final_score,
        semantic=semantic_sim,
        skill_score=skill_score,
        exp_score=exp_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        candidate_years=candidate_years,
        required_years=required_years,
    )

    return {
        "scores": {
            "semantic_similarity": round(semantic_sim, 1),
            "skill_overlap": round(skill_score, 1),
            "experience_match": round(exp_score, 1),
            "final_score": final_score,
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "explanation": explanation,
    }
