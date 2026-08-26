# Architectural Tradeoffs & System Limitations

## 1. The Hybrid Design Rationale

ResumeRank intentionally separates **Candidate Scoring & Ranking** from **Qualitative Evaluation**:

```
           Candidate Data + Job Specification
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ 1. Deterministic Math Scoring │ │ 2. Optional LLM Critique Layer│
│ • Dense Vectors (MiniLM-L6)   │ │ • Gemini 1.5 Flash / GPT-4o   │
│ • Jaccard Skill Taxonomy      │ │ • Explicit System Prompt      │
│ • Experience Ratio Math       │ │ • Executive Interview Notes   │
│                               │ │ • Probing Questions for Gaps  │
│ ✅ 100% Auditable & Verifiable│ │                               │
│ ✅ Zero Hallucination Risk    │ │ ✅ High Qualitative Judgment  │
│ ✅ $0.00 Cost per Screen      │ │ ✅ Nuanced Context Synthesis  │
└───────────────┬───────────────┘ └───────────────┬───────────────┘
                │                                 │
                └────────────────┬────────────────┘
                                 ▼
                    Unified Recruiter Dashboard
```

### Why NOT use an LLM for numeric ranking scores?
1. **Non-Determinism & Score Drift:** Asking a generative LLM to output a score from 1-100 results in arbitrary score variations for identical inputs across runs, creating legal and compliance risks for hiring software.
2. **Hallucination & Bias:** LLMs are prone to inventing candidate credentials or hallucinating experience. Our mathematical scoring grounds sub-scores strictly in extracted tokens and 384-dimensional vector cosine geometry.
3. **Cost & Latency at Scale:** Scoring 500 resumes with full LLM prompts costs significant API tokens and takes minutes. Our local dense embedding engine scores 14 resumes in <3 seconds with zero API costs.
4. **Best of Both Worlds:** Math computes the objective rank, while the LLM acts as an executive assistant summarizing qualitative interview questions and strengths.

---

## 2. In Scope vs. Scoped Out

### In Scope
- Multi-format parsing (PDF via `pdfplumber`/`pypdf`, DOCX via `python-docx`, TXT)
- Normalized skill alias mapping (`postgres` $\leftrightarrow$ `postgresql`, `k8s` $\leftrightarrow$ `kubernetes`)
- Dense semantic vector similarity (`sentence-transformers/all-MiniLM-L6-v2`) with TF-IDF fallback
- Optional Google Gemini / OpenAI REST integration with explicit `RECRUITER_SYSTEM_PROMPT`
- Non-blocking SSE progress streaming
- Dynamic weight sliders and dealbreaker knockout criteria
- Candidate pipeline staging (Shortlisted / In Review / Rejected) with custom recruiter notes
- CSV and JSON export generation

### Scoped Out (Future Roadmap)
- **OCR for Scanned Image PDFs:** Currently image-only PDFs produce empty text. Adding Tesseract OCR would enable scanned resume processing.
- **Section Segmentation:** Segmenting headings (EXPERIENCE vs EDUCATION) with a fine-tuned layout transformer (LayoutLMv3) for higher precision.
- **Persistent Database:** SQLite / PostgreSQL persistence to store past screening historical runs.
- **Multi-tenant Authentication:** User logins, team permissions, and ATS webhooks (Greenhouse / Ashby sync).

---

## 3. Known Failure Cases & Mitigations

| Failure Mode | Root Cause | System Mitigation |
|---|---|---|
| **Scanned/Rasterized PDF** | No embedded font layer | Handled in `ScreeningService`, flagged as malformed without crashing batch |
| **Two-column layout PDF** | Text bounding boxes interleaved | `pdfplumber` line-level clustering extracts layout in reading order |
| **Missing API Key** | User running completely offline | Graceful fallback to deterministic match rationale; logs offline mode |
| **Long Resume (>2000 tokens)** | Exceeds MiniLM max seq length | Windowed prefix extraction captures executive summary and top roles |
| **API Timeout / Rate Limit** | Remote LLM provider network spike | Timeout set to 10s; gracefully logs error and completes screening |
