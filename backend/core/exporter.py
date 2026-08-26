"""Export screening results to CSV and JSON."""
from __future__ import annotations

import csv
import io
import json
from typing import Any


def to_csv(candidates: list[dict[str, Any]]) -> str:
    """Serialise ranked candidates to CSV string."""
    if not candidates:
        return ""

    output = io.StringIO()
    fieldnames = [
        "rank", "name", "filename", "email", "phone",
        "final_score", "semantic_similarity", "skill_overlap", "experience_match",
        "years_of_experience", "matched_skills", "missing_skills",
        "education", "explanation",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for item in candidates:
        cand = item.get("candidate", {})
        scores = item.get("scores", {})
        row = {
            "rank": item.get("rank"),
            "name": cand.get("name") or "",
            "filename": cand.get("filename", ""),
            "email": cand.get("email") or "",
            "phone": cand.get("phone") or "",
            "final_score": scores.get("final_score", 0),
            "semantic_similarity": scores.get("semantic_similarity", 0),
            "skill_overlap": scores.get("skill_overlap", 0),
            "experience_match": scores.get("experience_match", 0),
            "years_of_experience": cand.get("years_of_experience") or "",
            "matched_skills": ", ".join(item.get("matched_skills", [])),
            "missing_skills": ", ".join(item.get("missing_skills", [])),
            "education": " | ".join(cand.get("education", [])),
            "explanation": item.get("explanation", ""),
        }
        writer.writerow(row)

    return output.getvalue()


def to_json(result: dict[str, Any]) -> str:
    """Serialise the full result to a pretty-printed JSON string."""
    return json.dumps(result, indent=2, ensure_ascii=False)
