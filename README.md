# ResumeRank — AI Resume Screening Agent

An end-to-end recruiter workspace that takes a Job Description and a batch of
resumes (PDF / DOCX / TXT), evaluates every candidate using a hybrid neural scoring engine
(dense vector embeddings + skill overlap + experience matching), and presents a ranked recruiter dashboard with qualitative AI critiques.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| NLP & Scoring | `sentence-transformers` (`all-MiniLM-L6-v2`), scikit-learn TF-IDF |
| LLM Critique | Google Gemini (`gemini-1.5-flash`) / OpenAI (`gpt-4o-mini`) via REST |
| Parsing | `pdfplumber`, `pypdf`, `python-docx` |
| Frontend | React 18 + TypeScript, Tailwind CSS v4, Vite, Framer Motion |
| Export | CSV / JSON via FastAPI streaming |

---

## Setup & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+
- ~1.5 GB disk space (PyTorch + model weights download on first run)

### 1. Clone & Set Up Backend

```bash
git clone <repo-url>
cd resume-screening-agent

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment (Optional LLM Integration)

```bash
cp .env.example .env
```

#### Optional: Enable LLM Qualitative Critiques
To enable free-form executive recruiter evaluations on top of the deterministic match scores:
1. **Google Gemini (Recommended / Free Tier):** Get an API key at [Google AI Studio](https://aistudio.google.com/) and set:
   ```bash
   GEMINI_API_KEY=your_actual_gemini_key_here
   ```
2. **OpenAI:** Get an API key at [OpenAI Platform](https://platform.openai.com/) and set:
   ```bash
   OPENAI_API_KEY=your_actual_openai_key_here
   ```
> 💡 **Graceful Fallback:** If no API key is configured, the agent runs in 100% offline mode using deterministic score rationales without error.

### 3. One-Command Dev Launcher

```bash
make dev
# Or: bash scripts/start_dev.sh
```

This starts both:
- **Frontend Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Interactive Swagger Docs:** http://localhost:8000/docs

---

## Running Tests

```bash
source .venv/bin/activate
pytest backend/tests/ -v
```

All 28 unit tests cover document parsing, hybrid mathematics, and LLM API mocking/fallbacks.

---

## Hybrid Architecture Design

```
Job Description + Resumes (.pdf, .docx, .txt)
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
[1. Document Parser]       [2. Entity Extractor]
 (pdfplumber, docx)         (Regex + Synonym Taxonomy)
      │                           │
      └─────────────┬─────────────┘
                    ▼
       [3. Hybrid Scoring Engine]
   • 45% Dense Vector Semantic (MiniLM-L6-v2)
   • 35% Exact Skill Jaccard Overlap
   • 20% Experience Match Ratio
                    │
                    ▼
         [4. Candidate Ranking]
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
[Offline Fallback Rationale]  [Optional LLM Critique]
(Deterministic Template)      (Gemini / OpenAI API)
         │                     │
         └──────────┬──────────┘
                    ▼
      [5. Recruiter Dashboard]
```

See [SCORING_METHOD.md](./SCORING_METHOD.md) and [TRADEOFFS.md](./TRADEOFFS.md) for full mathematical details.
