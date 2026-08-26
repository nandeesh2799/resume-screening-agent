"""
LLM qualitative critique module for candidate evaluation.
Augments deterministic scoring with an LLM-generated qualitative critique.
Supports Google Gemini and OpenAI with graceful offline fallback.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# Explicit System Prompt as a dedicated top-level constant
RECRUITER_SYSTEM_PROMPT = """You are an expert technical recruiter reviewing a candidate against a specific job description. You will be given the job description, the candidate's extracted resume data, and a computed match score with sub-scores. 

Your job:
- Write a 3-5 sentence executive summary of this candidate's fit.
- Name 2-3 specific strengths that match the JD.
- Name 1-2 specific gaps or risks a recruiter should probe in an interview.
- Base every claim ONLY on the resume text and JD provided. Never invent skills, employers, or experience not present in the input. If information is missing, say so explicitly rather than guessing.
- Do not restate the numeric score; add judgment the numbers can't capture."""


def _call_gemini_api(api_key: str, prompt: str) -> Optional[str]:
    """Call Google Gemini API via REST."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": RECRUITER_SYSTEM_PROMPT}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 400,
        },
    }
    with httpx.Client(timeout=10.0) as client:
        response = client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                return parts[0]["text"].strip()
    return None


def _call_openai_api(api_key: str, prompt: str) -> Optional[str]:
    """Call OpenAI API via REST."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": RECRUITER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 400,
    }
    with httpx.Client(timeout=10.0) as client:
        response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            return choices[0]["message"].get("content", "").strip()
    return None


def generate_llm_critique(
    jd_text: str,
    candidate_dict: dict,
    scores_dict: dict,
    matched_skills: list[str],
    missing_skills: list[str],
) -> Optional[str]:
    """
    Generate an LLM qualitative critique if an API key is configured.
    Falls back gracefully to None if no key is set or if the call fails.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not gemini_key and not openai_key:
        logger.info("LLM Critique: Offline mode (no GEMINI_API_KEY or OPENAI_API_KEY configured).")
        return None

    candidate_name = candidate_dict.get("name") or candidate_dict.get("filename", "Candidate")
    skills_str = ", ".join(candidate_dict.get("skills", [])) or "None detected"
    education_str = " | ".join(candidate_dict.get("education", [])) or "Not specified"
    exp_years = candidate_dict.get("years_of_experience")
    exp_str = f"{exp_years:.1f} years" if exp_years is not None else "Not specified"
    resume_preview = candidate_dict.get("raw_text", "")[:1800]

    user_prompt = f"""Job Description:
{jd_text[:1500]}

Candidate Profile:
- Name: {candidate_name}
- Total Experience: {exp_str}
- Extracted Skills: {skills_str}
- Education: {education_str}

Computed Mathematical Match Scores:
- Semantic Similarity: {scores_dict.get('semantic_similarity', 0):.1f}%
- Skill Overlap: {scores_dict.get('skill_overlap', 0):.1f}%
- Experience Match: {scores_dict.get('experience_match', 0):.1f}%
- Final Score: {scores_dict.get('final_score', 0):.1f}/100
- Confirmed Matched Skills: {', '.join(matched_skills[:8]) or 'None'}
- Missing Required Skills: {', '.join(missing_skills[:8]) or 'None'}

Resume Excerpt:
{resume_preview}

Please provide your 3-5 sentence qualitative executive evaluation according to your instructions."""

    try:
        if gemini_key:
            logger.info("LLM Critique: Generating critique via Gemini API for %s", candidate_name)
            critique = _call_gemini_api(gemini_key, user_prompt)
            if critique:
                return critique

        if openai_key:
            logger.info("LLM Critique: Generating critique via OpenAI API for %s", candidate_name)
            critique = _call_openai_api(openai_key, user_prompt)
            if critique:
                return critique

    except Exception as exc:
        logger.warning("LLM Critique API call failed for %s: %s. Continuing with deterministic scoring.", candidate_name, exc)
        return None

    return None
