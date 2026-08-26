#!/usr/bin/env python3
"""
Generates the ATS-friendly PDF dataset and pre-computed screening outputs.
Run: python scripts/generate_sample_outputs.py
"""
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.exporter import to_csv, to_json
from backend.core.parser import parse_resume
from backend.core.scorer import (
    _extract_jd_skills,
    _extract_required_experience,
    score_candidate,
)
from scripts.generate_ats_pdf_resumes import main as generate_all_pdfs


def generate_outputs():
    jd_path = Path("sample_jd.txt")
    if not jd_path.exists():
        print("sample_jd.txt not found")
        return

    jd_text = jd_path.read_text(encoding="utf-8")
    jd_skills = _extract_jd_skills(jd_text)
    req_years = _extract_required_experience(jd_text)

    scored, failed = [], []
    resumes_dir = Path("sample_resumes")

    print("\nScoring all ATS-friendly sample PDF resumes...")
    for rp in sorted(resumes_dir.iterdir()):
        if rp.suffix.lower() not in {".pdf", ".docx", ".doc", ".txt"}:
            continue
        print(f"  Scoring {rp.name}...")
        try:
            parsed = parse_resume(rp.name, rp.read_bytes())
            res = score_candidate(jd_text, parsed, jd_skills=jd_skills, required_years=req_years)
            scored.append({
                "candidate": parsed,
                "scores": res["scores"],
                "rank": 0,
                "explanation": res["explanation"],
                "matched_skills": res["matched_skills"],
                "missing_skills": res["missing_skills"],
            })
        except Exception as e:
            print(f"    Failed: {e}")
            failed.append({"filename": rp.name, "reason": str(e)})

    scored.sort(key=lambda c: c["scores"]["final_score"], reverse=True)
    for i, c in enumerate(scored):
        c["rank"] = i + 1

    result = {
        "job_description_preview": jd_text[:500],
        "total_processed": len(scored),
        "total_failed": len(failed),
        "candidates": scored,
        "failed_files": failed,
    }

    out = Path("outputs")
    out.mkdir(exist_ok=True)
    (out / "screening_results.csv").write_text(to_csv(scored), encoding="utf-8")
    (out / "screening_results.json").write_text(to_json(result), encoding="utf-8")

    print(f"\nSaved outputs/ ({len(scored)} valid candidates, {len(failed)} flagged files)")
    if scored:
        top = scored[0]
        print(f"🥇 Top Ranked: {top['candidate'].get('name') or top['candidate']['filename']} ({top['scores']['final_score']:.1f}/100)")


if __name__ == "__main__":
    generate_all_pdfs()
    generate_outputs()
