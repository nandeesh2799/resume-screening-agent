"""
FastAPI routes for the Resume Screening Agent.
"""
from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from backend.core import config
from backend.core.exporter import to_csv, to_json
from backend.core.scorer import _extract_jd_skills, _extract_required_experience
from backend.models.schemas import ScoredCandidate, ScreeningResult
from backend.services.screening_service import ScreeningService

logger = logging.getLogger(__name__)
router = APIRouter()

SAMPLE_JDS = [
    {
        "id": "fullstack",
        "title": "Senior Full Stack Engineer (FinTech)",
        "department": "Engineering",
        "experience": "5+ years",
        "content": """Senior Full Stack Engineer — FinTech Startup (Remote)

About the Role:
We are looking for a Senior Full Stack Engineer to join our core product team.
You will architect and build scalable APIs and dynamic web interfaces for our
payment intelligence platform serving 1M+ small business merchants.

Requirements:
- 5+ years of professional software development experience
- Strong proficiency in Python (FastAPI or Django) for backend development
- Strong proficiency in React with TypeScript for frontend development
- Experience with relational databases (PostgreSQL) and caching (Redis)
- Experience with Docker and Kubernetes for container orchestration
- Comfortable with cloud infrastructure — AWS or GCP preferred
- Experience with CI/CD pipelines (GitHub Actions or Jenkins)
- Strong understanding of REST API design and microservices architecture
- Excellent communication skills and ability to work in an Agile/Scrum environment

Nice to Have:
- Experience with Apache Kafka or similar message brokers
- Familiarity with data engineering or ML pipelines
- GraphQL experience
- Security engineering awareness (OAuth2, JWT, OWASP)""",
    },
    {
        "id": "aiml",
        "title": "Staff AI / ML Engineer",
        "department": "AI Research & Platform",
        "experience": "6+ years",
        "content": """Staff AI / Machine Learning Engineer — GenAI & NLP Platform

About the Role:
We are seeking an experienced ML Engineer to lead development of our enterprise
LLM orchestration pipeline and deep learning models.

Requirements:
- 6+ years of hands-on Machine Learning & Deep Learning engineering experience
- Strong proficiency in Python, PyTorch, and TensorFlow
- Deep expertise in Natural Language Processing (NLP), Transformers, and LLM fine-tuning (RLHF, LoRA, BERT)
- Experience deploying scalable inference endpoints with FastAPI, Docker, and Kubernetes on AWS or GCP
- Experience with large-scale distributed streaming (Kafka, Spark, Airflow)
- Proficiency in SQL, PostgreSQL, and vector databases (Redis, Pinecone)
- Track record of shipping production ML systems serving high throughput

Nice to Have:
- Ph.D. or Master's in Computer Science / Machine Learning
- Experience with LangChain, LlamaIndex, RAG architectures
- Published research in top AI venues (NeurIPS, ICML, ACL)""",
    },
    {
        "id": "devops",
        "title": "Lead Cloud DevOps & Platform Engineer",
        "department": "Infrastructure",
        "experience": "5+ years",
        "content": """Lead Cloud DevOps & Platform Engineer (Remote)

About the Role:
We are looking for a Lead DevOps Engineer to scale our multi-region Kubernetes infrastructure
and automate continuous delivery across 40+ microservices.

Requirements:
- 5+ years in DevOps, Platform Engineering, or Site Reliability Engineering (SRE)
- Expert knowledge of Kubernetes, Docker, and container networking
- Strong experience with Infrastructure as Code (Terraform, Ansible)
- Deep proficiency in AWS (EKS, EC2, S3, RDS, Lambda) or GCP
- Hands-on scripting in Python, Bash, and Go
- Proven experience with CI/CD automation (GitHub Actions, Jenkins, ArgoCD)
- Strong observability background: Prometheus, Grafana, ELK stack
- Solid understanding of Linux system internals and network security

Nice to Have:
- CKA (Certified Kubernetes Administrator) certification
- Experience managing Kafka clusters and Redis at scale
- Zero-trust security, OAuth2, and SOC2 compliance experience""",
    },
    {
        "id": "dataeng",
        "title": "Senior Data Engineer",
        "department": "Data & Analytics",
        "experience": "4+ years",
        "content": """Senior Data Engineer — Enterprise Data Lake & Streaming

About the Role:
Join our Data Platform team to build real-time streaming pipelines, data lake architecture,
and robust ETL/ELT workflows.

Requirements:
- 4+ years of data engineering experience building production pipelines
- Advanced proficiency in Python and SQL
- Strong experience with Apache Spark, Kafka, and Airflow
- Experience with modern cloud data warehouses (Snowflake, BigQuery, or Redshift)
- Experience with dbt for data modeling and transformations
- Cloud experience on AWS (S3, Glue, EMR) or GCP
- Experience with Docker, Git, and data quality testing frameworks

Nice to Have:
- Databricks or Spark certification
- Experience with real-time analytics and lakehouse architectures (Iceberg, Delta)
- Experience mentoring junior engineers and leading architectural discussions""",
    },
]


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": config.PROJECT_NAME,
        "version": config.VERSION,
        "environment": config.ENVIRONMENT,
    }


@router.get("/samples")
async def get_samples():
    """Return pre-configured sample JDs and sample resume metadata."""
    sample_files = ScreeningService.get_sample_files()
    return {
        "job_descriptions": SAMPLE_JDS,
        "sample_resumes": sample_files,
    }


@router.get("/sample-file/{filename}")
async def get_sample_file(filename: str):
    """Download or view a specific sample resume file."""
    file_path = config.SAMPLE_RESUMES_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Sample resume not found")
    return FileResponse(file_path, filename=filename)


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
            # Emit SSE Progress Event
            progress = {
                "type": "progress",
                "current": idx + 1,
                "total": total,
                "filename": filename,
            }
            yield f"data: {json.dumps(progress)}\n\n"
            await asyncio.sleep(0.01)

            # Delegate sync processing to thread pool
            loop = asyncio.get_event_loop()
            scored, error = await loop.run_in_executor(
                None,
                ScreeningService.process_single_resume,
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

        # Rank candidates by final composite score
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


@router.post("/screen-samples")
async def screen_samples(
    job_description: Annotated[str, Form()],
):
    """
    Screen all sample resumes located on the server against the given JD.
    """
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    if not config.SAMPLE_RESUMES_DIR.exists():
        raise HTTPException(status_code=404, detail="Sample resumes directory not found.")

    sample_files = [
        p for p in sorted(config.SAMPLE_RESUMES_DIR.iterdir())
        if p.suffix.lower() in config.ALLOWED_EXTENSIONS
    ]
    if not sample_files:
        raise HTTPException(status_code=404, detail="No sample resumes found.")

    jd_skills = _extract_jd_skills(job_description)
    required_years = _extract_required_experience(job_description)

    async def event_generator():
        scored_list: list[ScoredCandidate] = []
        failed_list: list[dict] = []
        total = len(sample_files)

        for idx, file_path in enumerate(sample_files):
            progress = {
                "type": "progress",
                "current": idx + 1,
                "total": total,
                "filename": file_path.name,
            }
            yield f"data: {json.dumps(progress)}\n\n"
            await asyncio.sleep(0.01)

            file_bytes = file_path.read_bytes()
            loop = asyncio.get_event_loop()
            scored, error = await loop.run_in_executor(
                None,
                ScreeningService.process_single_resume,
                file_path.name,
                file_bytes,
                job_description,
                jd_skills,
                required_years,
            )
            if error:
                failed_list.append(error)
            elif scored:
                scored_list.append(scored)

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
