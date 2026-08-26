# ResumeRank — AI Resume Screening Agent

An end-to-end resume screening tool that takes a Job Description and a batch of
resumes (PDF / DOCX / TXT), scores every candidate using semantic similarity +
skill overlap, and presents a ranked recruiter dashboard with explanations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| NLP | `sentence-transformers` (all-MiniLM-L6-v2), scikit-learn TF-IDF |
| Parsing | `pdfplumber`, `pypdf`, `python-docx` |
| Frontend | React 18 + TypeScript, Tailwind CSS v4, Vite |
| Export | CSV / JSON via FastAPI streaming |

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- ~1.5 GB disk space (PyTorch + model weights download on first run)

### 1. Clone & set up backend

```bash
git clone <repo-url>
cd resume-screening-agent

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ The first `pip install` downloads PyTorch (~800 MB) and the
> `all-MiniLM-L6-v2` model (~80 MB from Hugging Face) automatically.
> Subsequent starts use the local cache.

### 2. Configure environment (optional)

```bash
cp .env.example .env
# Edit .env if you want to change PORT or MAX_FILE_SIZE_MB
```

### 3. Start the backend

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

### 4. Set up and start the frontend (dev mode)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. (Optional) Production build

```bash
cd frontend
npm run build          # outputs to frontend/dist/
cd ..
uvicorn backend.main:app --port 8000   # serves the built frontend too
```

---

## Running Tests

```bash
source .venv/bin/activate
pytest backend/tests/ -v
```

---

## Using the App

1. **Step 1 — Job Description:** Paste the full JD text (or type it). Click Next.
2. **Step 2 — Upload Resumes:** Drag-and-drop PDF / DOCX / TXT files. Click Analyse.
3. **Step 3 — Results:** Ranked candidate cards appear. Click any card to expand:
   - Score breakdown (semantic / skill / experience sub-scores)
   - Matched skills (green) and gaps (red)
   - Plain-English explanation of the ranking
4. **Export:** Click CSV or JSON to download results.

---

## Sample Data

| Path | Description |
|------|-------------|
| `sample_jd.txt` | Senior Full Stack Engineer JD (fintech) |
| `sample_resumes/` | 12 resumes (TXT format): ML engineer, backend dev, designer, junior, etc. |
| `outputs/` | Pre-generated CSV and JSON results |

---

## Project Structure

```
resume-screening-agent/
├── backend/
│   ├── api/routes.py          # FastAPI endpoints + SSE streaming
│   ├── core/
│   │   ├── parser.py          # PDF/DOCX/TXT text extraction + field extraction
│   │   ├── scorer.py          # Semantic similarity + skill overlap + experience scoring
│   │   └── exporter.py        # CSV/JSON serialisation
│   ├── models/schemas.py      # Pydantic v2 data models
│   ├── tests/
│   │   ├── test_parser.py
│   │   └── test_scorer.py
│   └── main.py                # FastAPI app + CORS + static file serving
├── frontend/
│   └── src/
│       ├── App.tsx             # Wizard flow (step 1-3)
│       ├── pages/ResultsPage.tsx
│       ├── components/        # Header, DropZone, CandidateCard, ScoreBadge, etc.
│       ├── hooks/useTheme.ts
│       ├── utils/api.ts       # SSE streaming + export helpers
│       └── types/index.ts     # TypeScript interfaces
├── sample_resumes/            # 12 synthetic resumes (mixed formats/quality)
├── sample_jd.txt
├── outputs/                   # Pre-generated screening_results.{csv,json}
├── SCORING_METHOD.md          # How scores are computed
├── TRADEOFFS.md               # What was scoped out, known failure cases
├── requirements.txt
└── .env.example
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/screen` | Upload JD + resumes → SSE stream of progress + result |
| POST | `/api/export/csv` | JSON body → CSV file download |
| POST | `/api/export/json` | JSON body → JSON file download |

---

## Known Limitations

See [TRADEOFFS.md](./TRADEOFFS.md) for a full list. Key ones:
- Scanned/image PDFs produce empty text (no OCR)
- First run requires downloading ~900 MB of model weights
- Performance on heavily templated/graphic resumes may vary

---

## License

MIT
