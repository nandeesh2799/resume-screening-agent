"""
Scoring module for the Resume Screening Agent.

Final Score = 0.45 × Semantic Similarity
            + 0.35 × Skill Overlap
            + 0.20 × Experience Match

All sub-scores are 0-100.
"""
from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Score weights
W_SEMANTIC = 0.45
W_SKILL = 0.35
W_EXP = 0.20

EXPECTED_EXP_YEARS = 5.0  # default when JD doesn't specify


# ---------------------------------------------------------------------------
# Sentence-Transformer singleton (lazy-loaded to avoid cold-start penalty)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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
    """
    Semantic cosine similarity using sentence-transformers.
    Falls back to TF-IDF if the model isn't available.
    Returns 0-100.
    """
    model = _get_st_model()
    if model is not None:
        try:
            embeddings = model.encode([jd_text[:2048], resume_text[:2048]])
            sim = float(np.dot(embeddings[0], embeddings[1]) / (
                np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]) + 1e-9
            ))
            # Clamp to [0, 1] then scale to 0-100
            return max(0.0, min(1.0, sim)) * 100
        except Exception as exc:
            logger.warning("Semantic encoding failed: %s", exc)
    return _tfidf_similarity(jd_text, resume_text) * 100


def _extract_jd_skills(jd_text: str) -> list[str]:
    """Pull skill keywords from the JD using the same vocabulary as the parser."""
    from backend.core.parser import SKILL_KEYWORDS, _extract_skills
    return _extract_skills(jd_text)


def _skill_overlap_score(jd_skills: list[str], candidate_skills: list[str]) -> tuple[float, list[str], list[str]]:
    """
    Jaccard-style overlap between JD skills and candidate skills.
    Returns (score_0_100, matched, missing).
    """
    if not jd_skills:
        return 50.0, [], []  # neutral if JD has no detectable skills

    jd_set = set(s.lower() for s in jd_skills)
    cand_set = set(s.lower() for s in candidate_skills)

    matched = sorted(jd_set & cand_set)
    missing = sorted(jd_set - cand_set)

    score = (len(matched) / len(jd_set)) * 100 if jd_set else 0.0
    return score, matched, missing


def _experience_match_score(
    candidate_years: Optional[float],
    jd_required_years: float,
) -> float:
    """
    Score how well candidate's experience matches the JD requirement.
    Returns 0-100.
    """
    if candidate_years is None:
        return 40.0  # unknown experience — penalise slightly

    if candidate_years >= jd_required_years:
        # At or above required: full score, with diminishing bonus
        bonus = min((candidate_years - jd_required_years) * 2, 10)
        return min(100.0, 90.0 + bonus)
    else:
        # Below required: linear penalty
        ratio = candidate_years / jd_required_years
        return ratio * 80.0  # max 80 if just under the bar


def _extract_required_experience(jd_text: str) -> float:
    """Parse the JD for a required years-of-experience figure."""
    patterns = [
        re.compile(r"(\d+)\+?\s*years?\s+(?:of\s+)?experience", re.IGNORECASE),
        re.compile(r"minimum\s+(\d+)\s+years?", re.IGNORECASE),
        re.compile(r"at\s+least\s+(\d+)\s+years?", re.IGNORECASE),
    ]
    for pat in patterns:
        m = pat.search(jd_text)
        if m:
            return float(m.group(1))
    return EXPECTED_EXP_YEARS


def _build_explanation(
    candidate_name: Optional[str],
    filename: str,
    semantic: float,
    skill_score: float,
    exp_score: float,
    final: float,
    matched: list[str],
    missing: list[str],
    candidate_years: Optional[float],
    required_years: float,
) -> str:
    name = candidate_name or filename
    band = "strong" if final >= 70 else ("moderate" if final >= 45 else "weak")

    parts: list[str] = [
        f"{name} is a {band} match with an overall score of {final:.0f}/100.",
    ]

    # Semantic
    if semantic >= 70:
        parts.append("Their background aligns closely with the role description.")
    elif semantic >= 45:
        parts.append("There is moderate thematic overlap with the job description.")
    else:
        parts.append("The resume content has limited overlap with the job description.")

    # Skills
    if matched:
        parts.append(f"Matching skills: {', '.join(matched[:8])}.")
    if missing:
        parts.append(f"Key skill gaps: {', '.join(missing[:6])}.")

    # Experience
    if candidate_years is not None:
        if candidate_years >= required_years:
            parts.append(
                f"Experience ({candidate_years:.0f} yrs) meets or exceeds the requirement ({required_years:.0f} yrs)."
            )
        else:
            parts.append(
                f"Experience ({candidate_years:.0f} yrs) is below the required {required_years:.0f} years."
            )
    else:
        parts.append("Years of experience could not be determined from the resume.")

    return " ".join(parts)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def score_candidate(
    jd_text: str,
    candidate: dict,
    jd_skills: Optional[list[str]] = None,
    required_years: Optional[float] = None,
) -> dict:
    """
    Score a single candidate dict against the JD.
    Returns a dict with keys: scores (dict), explanation, matched_skills, missing_skills.
    """
    if jd_skills is None:
        jd_skills = _extract_jd_skills(jd_text)
    if required_years is None:
        required_years = _extract_required_experience(jd_text)

    resume_text = candidate.get("raw_text", "")

    # 1. Semantic similarity
    semantic = _semantic_similarity(jd_text, resume_text)

    # 2. Skill overlap
    cand_skills = candidate.get("skills", [])
    skill_score, matched, missing = _skill_overlap_score(jd_skills, cand_skills)

    # 3. Experience match
    exp_score = _experience_match_score(
        candidate.get("years_of_experience"), required_years
    )

    # 4. Weighted final
    final = (W_SEMANTIC * semantic + W_SKILL * skill_score + W_EXP * exp_score)
    final = round(min(100.0, max(0.0, final)), 1)

    explanation = _build_explanation(
        candidate.get("name"),
        candidate.get("filename", ""),
        semantic,
        skill_score,
        exp_score,
        final,
        matched,
        missing,
        candidate.get("years_of_experience"),
        required_years,
    )

    return {
        "scores": {
            "semantic_similarity": round(semantic, 1),
            "skill_overlap": round(skill_score, 1),
            "experience_match": round(exp_score, 1),
            "final_score": final,
        },
        "explanation": explanation,
        "matched_skills": matched,
        "missing_skills": missing,
    }
