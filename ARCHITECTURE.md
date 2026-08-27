# ResumeRank AI — System Architecture & Design Blueprint

## 1. High-Level Architecture Overview

ResumeRank is engineered as a decoupled, production-grade AI candidate screening and semantic ranking platform. It consists of a high-performance **FastAPI asynchronous backend** with a dedicated **NLP scoring pipeline** and a modern **React 18 + TypeScript + Tailwind CSS** frontend.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          React 18 + TypeScript Client                       │
│  ┌────────────────────┐ ┌──────────────────────┐ ┌───────────────────────┐  │
│  │  1. Role Spec &    │ │ 2. Batch Upload &    │ │ 3. Candidate Ranking  │  │
│  │  Skill Extraction  │ │  File Ingestion      │ │  & Comparison Matrix  │  │
│  └─────────┬──────────┘ └──────────┬───────────┘ └───────────▲───────────┘  │
└────────────┼───────────────────────┼─────────────────────────┼──────────────┘
             │                       │                         │
             │ HTTP POST (Form/Data) │ SSE Stream (Events)     │ JSON / CSV
             ▼                       ▼                         │
┌──────────────────────────────────────────────────────────────┴──────────────┐
│                            FastAPI Backend (Port 8000)                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 1. API Routing Layer (`backend/api/routes.py`)                        │  │
│  │    • `/api/screen` (SSE Stream)      • `/api/samples`                 │  │
│  │    • `/api/screen-samples` (SSE)     • `/api/export/{csv,json}`       │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 2. Service Layer (`backend/services/screening_service.py`)            │  │
│  │    • Asynchronous Batch Task Coordination                             │  │
│  │    • Threadpool Offloading for CPU-intensive NLP inference            │  │
│  │    • Error Recovery & Malformed Document Sandboxing                   │  │
│  └───────────────────┬───────────────────────────────┬───────────────────┘  │
│                      │                               │                      │
│                      ▼                               ▼                      │
│  ┌──────────────────────────────┐        ┌───────────────────────────────┐  │
│  │ 3. Document Parsing Engine   │        │ 4. Hybrid NLP Scoring Engine  │  │
│  │    (`backend/core/parser.py`)│        │    (`backend/core/scorer.py`) │  │
│  │    • PDF (pdfplumber + pypdf)│        │    • Dense Embeddings (45%)   │  │
│  │    • DOCX (python-docx)      │        │      all-MiniLM-L6-v2         │  │
│  │    • TXT & UTF-8 Fallback    │        │    • Jaccard Skill Overlap    │  │
│  │    • Regex Named Entity      │        │      Taxonomy (35%)           │  │
│  │      Extraction              │        │    • Experience Metric (20%)  │  │
│  └──────────────────────────────┘        └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Layer Responsibilities

```
resume-screening-agent/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py              # HTTP Controllers & SSE Streaming endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Centralized environment variables & defaults
│   │   ├── parser.py              # Multi-format document parser & entity extractor
│   │   ├── scorer.py              # Dense vector embeddings + Jaccard skill matcher
│   │   └── exporter.py            # CSV & JSON serialisation utilities
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py             # Pydantic v2 domain contracts & DTOs
│   ├── services/
│   │   ├── __init__.py
│   │   └── screening_service.py   # Business logic & batch execution orchestration
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_parser.py         # Unit tests for multi-format text extraction
│   │   └── test_scorer.py         # Unit tests for scoring mathematics & fallbacks
│   └── main.py                    # Application factory, CORS, and static file mount
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Header, Cards, Drawer, Modal, Step forms)
│   │   ├── hooks/                 # React hooks (useAmbience background switcher, etc.)
│   │   ├── pages/                 # Full dashboard pages (ResultsPage)
│   │   ├── types/                 # TypeScript interfaces and SSE event payloads
│   │   ├── utils/                 # API client utilities (SSE generator, export triggers)
│   │   ├── App.tsx                # Wizard state machine
│   │   ├── index.css              # Glassmorphic cyber theme stylesheet
│   │   └── main.tsx               # React root entrypoint
│   ├── package.json
│   └── vite.config.ts             # Vite configuration with Tailwind CSS & API proxy
├── scripts/
│   ├── start_dev.sh               # 1-Command startup script for backend + frontend
│   ├── run_tests.sh               # Complete verification runner
│   └── generate_sample_outputs.py # PDF/DOCX resume generator + output exporter
├── sample_resumes/                # 15 Multi-format test resumes (14 valid + 1 invalid scan)
├── sample_jd.txt                  # FinTech Full Stack Senior Engineer benchmark
├── sample_output/                 # Exported results in CSV & JSON
├── Makefile                       # Developer automation workflow tasks
├── pytest.ini                     # Pytest runner configuration
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # Container orchestration
├── SCORING_METHOD.md              # Mathematical formulas & weighting rationale
├── TRADEOFFS.md                   # Engineering tradeoffs & failure mode catalog
└── README.md                      # Comprehensive developer setup guide
```

---

## 3. Data Processing Lifecycle

1. **Job Specification Ingestion**:
   - The user inputs text or selects a 1-click benchmark.
   - `_extract_jd_skills` identifies the target skill set via a vocabulary taxonomy.
   - `_extract_required_experience` identifies minimum years required via regex heuristic.

2. **Resume Batch Parsing**:
   - Resumes in **PDF**, **DOCX**, or **TXT** format are read into byte streams.
   - `pdfplumber` extracts layout-preserved text, falling back to `pypdf`.
   - `python-docx` extracts structured paragraph text.
   - Heuristic NER extracts: Candidate Name, Email, Phone, Skills detected, Education degrees, and Years of Experience.

3. **Hybrid Scoring Pipeline**:
   - **Semantic Similarity ($S_{\text{semantic}}$ - 45%)**: Computes cosine similarity between 384-dimensional dense vectors generated by `sentence-transformers/all-MiniLM-L6-v2`. Falls back to TF-IDF cosine similarity if torch is running under constrained CPU memory.
   - **Skill Taxonomy Overlap ($S_{\text{skills}}$ - 35%)**: Calculates Jaccard-style weighted intersection:
     $$\text{Skill Overlap} = \frac{|\text{Candidate Skills} \cap \text{JD Skills}|}{|\text{JD Skills}|} \times 100$$
   - **Experience Match ($S_{\text{exp}}$ - 20%)**: Compares extracted candidate years against required threshold:
     $$\text{Exp Score} = \min\left(100, \frac{\text{Candidate Years}}{\text{Required Years}} \times 100\right)$$
   - **Composite Score**:
     $$\text{Final Score} = 0.45 \times S_{\text{semantic}} + 0.35 \times S_{\text{skills}} + 0.20 \times S_{\text{exp}}$$

4. **Real-time Non-blocking Delivery**:
   - Per-file progress events (`{"type": "progress", "current": N, "total": M, "filename": "..."}`) are streamed back via Server-Sent Events (SSE).
   - Final ranked payload is delivered to the React client with instant ranking, breakdown metrics, and recruiter rationale.
