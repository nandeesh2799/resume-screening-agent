# Tradeoffs & Known Limitations

## What was scoped in vs. out

### In scope
- Full-text extraction from PDF, DOCX, and TXT
- Semantic similarity via local sentence-transformers (no API key needed)
- Skill overlap scoring with a curated vocabulary
- Experience year extraction with regex heuristics
- Rule-based natural language explanations
- Non-blocking streaming UI with SSE progress updates
- Sort, filter, and export (CSV + JSON)
- Dark mode, drag-and-drop, error handling

### Scoped out (with more time)
- **LLM-generated explanations:** Using Gemini or GPT-4 via API would produce richer,
  more personalised explanations. Kept out to avoid mandatory API key setup.
- **PDF layout-aware parsing:** Heavy graphic/template-based PDFs (e.g. two-column
  InDesign layouts) often produce garbled text extraction. A layout parser (e.g.
  LayoutLMv3, Unstructured.io) would handle these better.
- **Persistent results storage:** Results are ephemeral. A SQLite or file-based
  persistence layer would let users revisit past runs.
- **Auth / multi-user:** The app is single-user, local-only. Adding auth would be
  straightforward with FastAPI's OAuth2 support.
- **Fuzzy skill matching:** "React.js" and "React" are treated as the same by our regex
  but "Next JS" vs "NextJS" may diverge. Adding fuzzy matching (rapidfuzz) would improve
  recall.
- **Resume sections detection:** The parser doesn't segment resume sections (EDUCATION /
  EXPERIENCE / SKILLS). A proper section segmenter would improve extraction accuracy.

## Known failure cases

| Scenario | Current behaviour | Ideal behaviour |
|----------|-------------------|-----------------|
| Scanned PDF (image-only) | Extracts empty text, flagged as failed | Run OCR (Tesseract) |
| Two-column PDF layout | Text extracted in wrong reading order | Layout-aware parsing |
| Non-English resumes | Skills matched against English vocabulary only | Multilingual embeddings |
| Very long resumes (>20 pages) | Truncated to 2 048 tokens for embedding | Chunked pooling |
| Obfuscated formats (.doc vs .docx) | .doc falls back to docx parser, may fail | python-docx2txt fallback |
| Skill synonyms ("JS" for "JavaScript") | May miss the synonym | Synonym map / fuzzy match |
| No experience dates in resume | Returns "unknown", score penalised | Contextual NER extraction |

## Performance notes

- The sentence-transformers model (`all-MiniLM-L6-v2`) is downloaded (~80 MB) on first
  run from Hugging Face. Subsequent runs use the local cache.
- CPU inference: ~0.5–2 s per resume. 20 resumes ≈ 30–40 s total.
- Memory: ~500 MB peak with the model loaded. Reduce by setting `MAX_FILE_SIZE_MB`.

## What I'd improve with more time

1. **LLM explanations** — structured prompt + Gemini Flash for 1-sentence "hire/no-hire"
   verdict with confidence and top 3 differentiating factors.
2. **Section-aware extraction** — detect SKILLS, EXPERIENCE, EDUCATION headings and
   parse each section separately for higher precision.
3. **Persistent run history** — store results in SQLite, allow comparing runs.
4. **Webhook/async API** — for very large batches (100+ resumes), run scoring as a
   background job and notify when done.
5. **Bias audit mode** — flag when gender, age, or nationality indicators might be
   affecting scores (fairness-aware NLP).
6. **CI test suite** — add GitHub Actions workflow running pytest on push.
