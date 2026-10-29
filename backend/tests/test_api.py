"""Integration tests for FastAPI REST and SSE endpoints."""
import json
import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "service" in data


def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "job_descriptions" in data
    assert "sample_resumes" in data
    assert len(data["job_descriptions"]) >= 4
    assert len(data["sample_resumes"]) > 0


def test_export_json_endpoint():
    payload = {
        "job_title": "Senior Python Engineer",
        "total_resumes": 1,
        "processed_resumes": 1,
        "candidates": [
            {
                "rank": 1,
                "name": "Jane Doe",
                "filename": "jane_doe.pdf",
                "email": "jane@example.com",
                "phone": "+1-555-0199",
                "years_of_experience": 5.0,
                "skills": ["python", "fastapi", "docker"],
                "matched_skills": ["python", "fastapi"],
                "missing_skills": ["aws"],
                "education": ["BS CS"],
                "scores": {
                    "semantic_similarity": 85.0,
                    "skill_overlap": 90.0,
                    "experience_match": 95.0,
                    "final_score": 88.5
                },
                "explanation": "Strong candidate match."
            }
        ],
        "top_skills_demanded": ["python", "fastapi", "aws"]
    }

    response = client.post("/api/export/json", json=payload)
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    exported = response.json()
    assert exported["job_title"] == "Senior Python Engineer"
    assert len(exported["candidates"]) == 1


def test_export_csv_endpoint():
    payload = {
        "job_title": "Staff ML Engineer",
        "total_resumes": 1,
        "processed_resumes": 1,
        "candidates": [
            {
                "rank": 1,
                "name": "Alex Chen",
                "filename": "alex.pdf",
                "email": "alex@example.com",
                "phone": "+1-555-0100",
                "years_of_experience": 7.0,
                "skills": ["pytorch", "python"],
                "matched_skills": ["pytorch"],
                "missing_skills": ["triton"],
                "education": ["MS AI"],
                "scores": {
                    "semantic_similarity": 90.0,
                    "skill_overlap": 80.0,
                    "experience_match": 95.0,
                    "final_score": 87.0
                },
                "explanation": "Solid ML background."
            }
        ],
        "top_skills_demanded": ["pytorch", "triton"]
    }

    response = client.post("/api/export/csv", json=payload)
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    csv_text = response.text
    assert "rank,name,filename" in csv_text
    assert "Solid ML background." in csv_text
