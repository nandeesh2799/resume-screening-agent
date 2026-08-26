#!/usr/bin/env python3
"""
Generates sample PDF/DOCX resumes and pre-computed screening outputs.
Run: python scripts/generate_sample_outputs.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from backend.core.parser import parse_resume
from backend.core.scorer import score_candidate, _extract_jd_skills, _extract_required_experience
from backend.core.exporter import to_csv, to_json


def generate_pdf():
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        out = Path("sample_resumes/13_emily_zhang_ml_pdf.pdf")
        doc = SimpleDocTemplate(str(out), pagesize=A4, topMargin=1.5*cm, bottomMargin=1.5*cm, leftMargin=2*cm, rightMargin=2*cm)
        styles = getSampleStyleSheet()
        body = ParagraphStyle("b", parent=styles["Normal"], fontSize=9, leading=14)
        h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=16, spaceAfter=4)
        h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=11, spaceBefore=10, spaceAfter=4)
        story = [
            Paragraph("Emily Zhang", h1),
            Paragraph("emily.zhang@ml.dev | +1-628-555-9021 | San Francisco, CA", body),
            Spacer(1, 0.3*cm),
            Paragraph("SUMMARY", h2),
            Paragraph("Machine Learning Engineer with 6 years experience in NLP and LLMs. Python, PyTorch, TensorFlow, FastAPI, Docker, AWS, Kubernetes, Kafka.", body),
            Paragraph("SKILLS", h2),
            Paragraph("Python, PyTorch, TensorFlow, scikit-learn, numpy, pandas, FastAPI, Docker, Kubernetes, AWS, GCP, SQL, PostgreSQL, Redis, Kafka, Airflow, Git, Machine Learning, Deep Learning, NLP, Transformers, LLM, BERT, RAG, LangChain", body),
            Paragraph("EXPERIENCE", h2),
            Paragraph("Senior ML Engineer — Scale AI (2022-Present, 2 years)", h2),
            Paragraph("Built RLHF training pipelines. Reduced annotation cost 40%. FastAPI inference at 20K RPM.", body),
            Paragraph("ML Engineer — Cohere (2020-2022, 2 years)", h2),
            Paragraph("Fine-tuned transformers. Data pipelines AWS EMR+S3. Docker/K8s deployment.", body),
            Paragraph("Data Scientist — Wish (2018-2020, 2 years)", h2),
            Paragraph("Recommendation models, A/B tests, 8% GMV improvement.", body),
            Paragraph("EDUCATION", h2),
            Paragraph("M.Sc. CS (Machine Learning), Carnegie Mellon University, 2018", body),
            Paragraph("B.Eng. Computer Engineering, University of Waterloo, 2016", body),
        ]
        doc.build(story)
        print(f"Generated PDF: {out}")
    except Exception as e:
        print(f"PDF skipped: {e}")


def generate_docx():
    try:
        from docx import Document
        out = Path("sample_resumes/14_raj_patel_docx.docx")
        doc = Document()
        doc.add_heading("Raj Patel", 0)
        doc.add_paragraph("raj.patel@dev.com | +44-7700-900-456 | London, UK")
        doc.add_heading("Skills", 1)
        doc.add_paragraph("Python, FastAPI, Django, TypeScript, React, NextJS, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, GCP, GraphQL, REST, Tailwind, GitHub Actions, CI/CD, Agile, Scrum")
        doc.add_heading("Experience", 1)
        doc.add_heading("Senior Full Stack Developer - Monzo Bank (2022-Present, 2 years)", 2)
        doc.add_paragraph("Built React TypeScript features for 8M user banking app. FastAPI microservices. Migrated to GraphQL.")
        doc.add_heading("Full Stack Developer - Deliveroo (2020-2022, 2 years)", 2)
        doc.add_paragraph("Django + React restaurant portal. WebSockets + Redis real-time tracking. CI/CD pipeline.")
        doc.add_heading("Education", 1)
        doc.add_paragraph("B.Sc. Computer Science, Imperial College London, 2019 | 5 years of experience")
        doc.save(str(out))
        print(f"Generated DOCX: {out}")
    except Exception as e:
        print(f"DOCX skipped: {e}")


def generate_outputs():
    jd_path = Path("sample_jd.txt")
    if not jd_path.exists():
        print("sample_jd.txt not found")
        return
    jd_text = jd_path.read_text()
    jd_skills = _extract_jd_skills(jd_text)
    req_years = _extract_required_experience(jd_text)
    scored, failed = [], []
    for rp in sorted(Path("sample_resumes").iterdir()):
        if rp.suffix.lower() not in {".pdf",".docx",".doc",".txt"}:
            continue
        print(f"  Scoring {rp.name}...")
        try:
            parsed = parse_resume(rp.name, rp.read_bytes())
            res = score_candidate(jd_text, parsed, jd_skills=jd_skills, required_years=req_years)
            scored.append({"candidate": parsed, "scores": res["scores"], "rank": 0, "explanation": res["explanation"], "matched_skills": res["matched_skills"], "missing_skills": res["missing_skills"]})
        except Exception as e:
            print(f"    Failed: {e}")
            failed.append({"filename": rp.name, "reason": str(e)})
    scored.sort(key=lambda c: c["scores"]["final_score"], reverse=True)
    for i, c in enumerate(scored): c["rank"] = i + 1
    result = {"job_description_preview": jd_text[:500], "total_processed": len(scored), "total_failed": len(failed), "candidates": scored, "failed_files": failed}
    out = Path("outputs")
    out.mkdir(exist_ok=True)
    (out / "screening_results.csv").write_text(to_csv(scored))
    (out / "screening_results.json").write_text(to_json(result))
    print(f"Saved outputs/ ({len(scored)} candidates, {len(failed)} failed)")
    if scored:
        top = scored[0]
        print(f"Top: {top['candidate'].get('name') or top['candidate']['filename']} ({top['scores']['final_score']:.0f}/100)")

if __name__ == "__main__":
    generate_pdf()
    generate_docx()
    print("\nScoring sample resumes...")
    generate_outputs()
