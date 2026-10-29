# ResumeRank AI — AI Resume Screening Agent

[![CI Pipeline](https://github.com/nandeesh2799/resume-screening-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/nandeesh2799/resume-screening-agent/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Sentence-Transformers](https://img.shields.io/badge/NLP-Sentence--Transformers-FF6F00?logo=huggingface&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-32%20Passing-brightgreen?logo=pytest)

An end-to-end recruiter workspace that takes a Job Description and a batch of resumes (PDF / DOCX / TXT), evaluates every candidate using a hybrid neural scoring engine (dense vector embeddings + skill overlap + experience matching), and presents a ranked recruiter workstation dashboard with qualitative AI critiques.

## 1. Project Description
ResumeRank AI is an autonomous recruiting agent that ingests candidate resumes and job descriptions to output ranked candidate pools, semantic alignment metrics, knockout criteria flags, and qualitative critiques.

## 2. Interactive Recruiter Workstation Demo
Below is a conceptual layout of the workstation dashboard in action, featuring live batch-uploads, dynamic parameter tuning sliders, candidate deep-dives, comparison grids, and real-time Server-Sent Event (SSE) progress tracking:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧬 RESUMERANK AI                      [Active Connection: SSE Stream OK]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. JOB SPECIFICATION                 │ 2. PIPELINE PARAMETERS               │
│ ┌──────────────────────────────────┐ │  • Semantic Similarity Weight (45%)  │
│ │ Senior Full Stack Engineer (Fin) │ │  • Jaccard Skill Overlap Weight (35%)│
│ └──────────────────────────────────┘ │  • Experience Match Weight (20%)     │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ 3. SCREENING RUN RESULTS (14 Resumes Processed)       [Download CSV] [JSON] │
│ ┌───┬───────────────────┬──────────────┬───────────────┬───────────────────┐│
│ │ Rk│ Candidate Name    │ Match Score  │ Exp (Req: 5y) │ Top Skills Match  ││
│ ├───┼───────────────────┼──────────────┼───────────────┼───────────────────┤│
│ │ 1 │ Carlos Mendez     │ 86.0 / 100   │ 7.0 Years     │ React, FastAPI    ││
│ │ 2 │ Sarah Chen        │ 83.2 / 100   │ 8.0 Years     │ PyTorch, NLP      ││
│ │ 3 │ James Okafor      │ 81.5 / 100   │ 6.0 Years     │ Python, AWS       ││
│ └───┴───────────────────┴──────────────┴───────────────┴───────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Core Features & Capabilities
*   **Multi-Format Document Parser:** Layout-preserved text extraction from PDF, DOCX, and TXT files, with auto-fallback and corrupted scan detection.
*   **Hybrid NLP Scoring Engine:** Integrates dense vector cosine similarity (via `all-MiniLM-L6-v2`), Jaccard skill overlaps, and experience validation thresholds.
*   **Dual LLM Critique Layer:** Qualitative candidate critique generation using Google Gemini (`gemini-1.5-flash`) or OpenAI (`gpt-4o-mini`) APIs.
*   **Zero-Dependency Offline Fallback:** Graceful fallback to deterministic rationales when no external API keys are configured.
*   **SSE Live Progress Streaming:** Async back-end chunk processing with Server-Sent Events showing files processed in real time.
*   **Workstation Dashboard:** Parameter weight sliders, knockout criteria, name/email/phone extraction, comparison modals, and CSV/JSON downloads.

## 4. System Architecture
```
Job Description + Resumes (.pdf, .docx, .txt)
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
[1. Document Parser]       [2. Heuristic Entity Extractor]
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
(Deterministic Heuristic)     (Gemini / OpenAI API)
         │                     │
         └──────────┬──────────┘
                    ▼
       [5. Recruiter Workstation]
```
For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 5. Setup & Installation
Follow these setup steps on a clean machine to run the application locally.

### Prerequisites
*   **Python:** Version `3.11` or `3.12`
*   **Node.js:** Version `18` or `20`

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd resume-screening-agent
```

### Step 2: Configure Backend Environment
```bash
# Create and activate Python virtual environment
python3 -m venv .venv

# Activate on macOS/Linux:
source .venv/bin/activate

# Activate on Windows (Command Prompt):
.venv\Scripts\activate.bat

# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

### Step 3: Configure Frontend Environment
```bash
cd frontend
npm install
cd ..
```

## 6. Configuring API Keys
Create a local environment configuration file:
```bash
cp .env.example .env
```
Open `.env` and configure your API keys:
*   **Google Gemini (Recommended):** Set `GEMINI_API_KEY=your_gemini_api_key_here`
*   **OpenAI:** Set `OPENAI_API_KEY=your_openai_api_key_here`

> 💡 **Offline Mode:** If neither key is provided, the application will run successfully in a fully offline fallback mode using a deterministic heuristics builder.

## 7. Running the Application End-to-End
You can run both the frontend and backend concurrently using the one-command launcher:
```bash
make dev
```
Alternatively, start the servers manually:
*   **Start Backend (Port 8000):** `uvicorn backend.main:app --reload --port 8000`
*   **Start Frontend (Port 5173):** `cd frontend && npm run dev`

Open your web browser and navigate to:
*   **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
*   **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

## 8. Sample Usage & Verification
You can execute a verification test of the pipeline using the included script. This runs the parser and scorer over the benchmark dataset and outputs the results:
```bash
python3 scripts/generate_sample_outputs.py
```
This script populates:
*   **Sample JD File:** [sample_jd.txt](./sample_jd.txt) (FinTech Full Stack Engineer role)
*   **Sample Resumes Folder:** [sample_resumes/](./sample_resumes/) (14 multi-format profiles: 11 PDF, 2 DOCX, 1 TXT)
*   **Precomputed Outputs:** [sample_output/ranked_results.csv](./sample_output/ranked_results.csv) and [sample_output/ranked_results.json](./sample_output/ranked_results.json)

## 9. Scoring Method Summary
The hybrid ranking score is computed as a weighted composite:
```
Final Score = (0.45 × Semantic Similarity) + (0.35 × Skill Overlap) + (0.20 × Experience Match)
```
Where:
*   **Semantic Similarity (45%):** Dense vector cosine similarity between candidate resume text and JD embeddings (`all-MiniLM-L6-v2`).
*   **Skill Overlap (35%):** Weighted Jaccard overlap coefficient of matched required skills against the role taxonomy.
*   **Experience Match (20%):** Ratio of candidate's verified experience years relative to the role's required minimum.

For detailed formulas and edge-case behavior, refer to [SCORING_METHOD.md](./SCORING_METHOD.md).

## 10. Tradeoffs & Limitations
*   **Entity Extraction:** Relies on robust regex and dictionaries instead of full-fledged NER models (like spaCy) to keep CPU requirements minimal.
*   **Embedding Pipeline:** Uses a lightweight CPU-optimized transformer model (`all-MiniLM-L6-v2`) which balances latency and representation power.
*   **LLM Latency:** Qualatative reviews are made asynchronous and run optional online calls, meaning processing time scale with network latency.

For the full catalog of design constraints, see [TRADEOFFS.md](./TRADEOFFS.md).

## 11. Tech Stack
*   **Backend:** Python 3.12, FastAPI, Uvicorn, PyTorch, Sentence-Transformers, pdfplumber, python-docx
*   **Frontend:** React 18, TypeScript, Tailwind CSS v4, Vite, Framer Motion
*   **Testing:** Pytest, HTTPX Mock


---

## 👨‍💻 Author & Engineering Showcase

**Nandeesh N K**  
Full-Stack Developer & AI Systems Engineer — Bengaluru, India  
- 🌐 **Interactive Portfolio:** [NandeeshOS (Live Demo)](https://nandeesh2799-portfolio.vercel.app)
- 💼 **LinkedIn:** [linkedin.com/in/nandeesh-n-k-729773270](https://linkedin.com/in/nandeesh-n-k-729773270)
- 🐙 **GitHub Profile:** [github.com/nandeesh2799](https://github.com/nandeesh2799)
- 📫 **Direct Email:** [nandeeshnk506@gmail.com](mailto:nandeeshnk506@gmail.com)
