# Scoring Method

## Overview

Each resume is scored against the job description using three complementary signals,
then blended into a single 0–100 relevance score.

```
Final Score = 0.45 × Semantic Similarity
            + 0.35 × Skill Overlap
            + 0.20 × Experience Match
```

---

## 1. Semantic Similarity (weight: 45%)

**Model:** `all-MiniLM-L6-v2` from the `sentence-transformers` library.

**Why this model?**  
It's a lightweight (80 MB) sentence encoder that produces 384-dimensional dense embeddings.
It achieves strong semantic understanding while being fast enough to score 20+ resumes
in a few seconds on CPU. It's trained on diverse NLP tasks, making it robust to
different resume styles and domain vocabulary.

**How it works:**
1. The full job description text (up to 2 048 tokens) and the full resume text are each
   encoded into a single embedding vector.
2. Cosine similarity between the two vectors is computed.
3. The raw cosine score (typically 0.2–0.9 for real text pairs) is scaled to 0–100
   via `max(0, min(1, cosine)) × 100`.

**Fallback:** If the `sentence-transformers` library is unavailable (e.g. memory
constrained environment), TF-IDF cosine similarity is used instead. This is less
accurate for paraphrase detection but still captures significant keyword overlap.

---

## 2. Skill Overlap (weight: 35%)

**Method:** Exact-match vocabulary lookup with Jaccard-style scoring.

**How it works:**
1. A curated vocabulary of ~90 technical skills is pre-defined (covering languages,
   frameworks, cloud platforms, databases, ML/AI tools, and soft skills).
2. The JD text is scanned for skill mentions → `jd_skills` set.
3. The resume text is scanned for skill mentions → `candidate_skills` set.
4. Overlap score = `|jd_skills ∩ candidate_skills| / |jd_skills| × 100`

**Why this complement to semantic similarity?**  
Semantic embeddings can be fooled by general domain language ("worked on software products")
without detecting whether a specific required skill (e.g. "Kubernetes") is actually present.
Explicit skill matching ensures a candidate who names the exact technology is rewarded.

**Limitation:** The vocabulary is finite. Rare or newly coined tools may not be detected.
This is mitigated by semantic similarity picking up the general domain alignment.

---

## 3. Experience Match (weight: 20%)

**Method:** Regex extraction + linear scoring function.

**How it works:**
1. Required years are extracted from the JD with patterns like:
   - `"5+ years of experience"`
   - `"minimum 3 years"`
   - `"at least 7 years"`
   - Default: 5 years if no explicit requirement found.
2. Candidate years are extracted from the resume with patterns like:
   - `"8 years of experience"`
   - Fallback: count job date ranges (e.g. `2018 – 2022`) and estimate.
3. Scoring:
   - At or above required → 90–100 (with up to 10 bonus points for seniority)
   - Below required → linear scale: `(candidate_years / required_years) × 80`
   - Unknown experience → 40 (neutral penalty)

---

## Score Band Definitions

| Band   | Score Range | Meaning                                   |
|--------|-------------|-------------------------------------------|
| 🟢 Strong | 70–100  | Highly aligned — recommend for interview  |
| 🟡 Moderate | 45–69 | Partial fit — worth a closer look         |
| 🔴 Weak | 0–44     | Poor fit — unlikely to meet requirements  |

---

## Design Decisions & Tradeoffs

- **Weights (0.45 / 0.35 / 0.20):** Semantic similarity gets the highest weight because
  it captures holistic fit. Skill overlap is weighted second-highest as recruiters
  typically have hard skill requirements. Experience is weighted lowest because years
  alone is a weak signal of actual ability.

- **CPU-only inference:** The model runs on CPU to ensure compatibility on any machine.
  Inference takes ~0.5–2 s per resume depending on length. A GPU would reduce this 10×.

- **No LLM API required:** The explanation text is rule-based, not LLM-generated.
  This avoids API key requirements, cost, and latency — though an LLM would produce
  richer, more nuanced explanations.
