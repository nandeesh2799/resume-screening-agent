"""
FastAPI routes for the Resume Screening Agent.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from backend.core.exporter import to_csv, to_json
from backend.core.parser import parse_resume
from backend.core.scorer import _extract_jd_skills, _extract_required_experience, score_candidate
from backend.models.schemas import (
    ExtractedCandidate,
    ScoreBreakdown,
    ScoredCandidate,
    ScreeningResult,
)

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _process_single_resume(
    filename: str,
    file_bytes: bytes,
    jd_text: str,
    jd_skills: list[str],
    required_years: float,
) -> tuple[ScoredCandidate | None, dict | None]:
    """
    Parse and score one resume.
    Returns (ScoredCandidate, None) on success, or (None, error_dict) on failure.
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        return None, {"filename": filename, "reason": f"Unsupported format {suffix!r}"}

    try:
        parsed = parse_resume(filename, file_bytes)
    except Exception as exc:
        logger.warning("Parse error for %s: %s", filename, exc)
        return None, {"filename": filename, "reason": str(exc)}

    try:
        result = score_candidate(jd_text, parsed, jd_skills=jd_skills, required_years=required_years)
    except Exception as exc:
        logger.warning("Scoring error for %s: %s", filename, exc)
        return None, {"filename": filename, "reason": f"Scoring failed: {exc}"}

    candidate = ExtractedCandidate(**parsed)
    scored = ScoredCandidate(
        candidate=candidate,
        scores=ScoreBreakdown(**result["scores"]),
        rank=0,  # assigned later
        explanation=result["explanation"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
    )
    return scored, None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/screen")
async def screen_resumes(
    job_description: Annotated[str, Form()],
    resumes: Annotated[list[UploadFile], File()],
):
    """
    Main screening endpoint.
    Accepts JD as form text and 1-N resume files.
    Streams back Server-Sent Events (SSE) with progress updates,
    then a final JSON payload.
    """
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    if not resumes:
        raise HTTPException(status_code=400, detail="At least one resume is required.")

    # Pre-compute JD metadata once
    jd_skills = _extract_jd_skills(job_description)
    required_years = _extract_required_experience(job_description)

    # Read all files first (FastAPI uploads are async)
    file_payloads: list[tuple[str, bytes]] = []
    for upload in resumes:
        content = await upload.read()
        file_payloads.append((upload.filename or "unknown", content))

    async def event_generator():
        scored_list: list[ScoredCandidate] = []
        failed_list: list[dict] = []
        total = len(file_payloads)

        for idx, (filename, file_bytes) in enumerate(file_payloads):
            # Yield progress event
            progress = {
                "type": "progress",
                "current": idx + 1,
                "total": total,
                "filename": filename,
            }
            yield f"data: {json.dumps(progress)}\n\n"
            await asyncio.sleep(0)  # yield control to event loop

            # Run sync I/O in thread to avoid blocking
            loop = asyncio.get_event_loop()
            scored, error = await loop.run_in_executor(
                None,
                _process_single_resume,
                filename,
                file_bytes,
                job_description,
                jd_skills,
                required_years,
            )
            if error:
                failed_list.append(error)
            elif scored:
                scored_list.append(scored)

        # Rank candidates
        scored_list.sort(key=lambda c: c.scores.final_score, reverse=True)
        for rank, cand in enumerate(scored_list, start=1):
            cand.rank = rank

        result = ScreeningResult(
            job_description_preview=job_description[:500],
            total_processed=len(scored_list),
            total_failed=len(failed_list),
            candidates=scored_list,
            failed_files=failed_list,
        )

        final_event = {
            "type": "result",
            "data": result.model_dump(),
        }
        yield f"data: {json.dumps(final_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/export/csv")
async def export_csv(payload: dict):
    """Accept a result JSON body and return a CSV file download."""
    candidates = payload.get("candidates", [])
    csv_content = to_csv(candidates)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="screening_results.csv"'},
    )


@router.post("/export/json")
async def export_json_file(payload: dict):
    """Return the full result as a downloadable JSON file."""
    content = to_json(payload)
    return StreamingResponse(
        iter([content]),
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="screening_results.json"'},
    )
