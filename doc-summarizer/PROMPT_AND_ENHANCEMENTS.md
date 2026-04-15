# Prompt, Enhancements, and TDD Implementation Log

## Initial Prompt Strategy

The app initially uses these prompts in `lib/summarizer.ts` for OpenAI-based summarization:

- **System prompt**
  - `You summarize documents for SaaS users. Keep summaries concise, factual, and plain English.`
- **User prompt template**
  - `Summarize this document in 2-4 clear sentences:\n\n${input}`

This remains the core behavior when an API key is available.

## Prompt and Summarization Optimizations

### OpenAI Path Improvements

- Upgraded model selection to `gpt-4.1-mini` (from older setup) for improved quality/cost balance.
- Kept concise summary instruction style (`2-4` sentences, factual, plain English).
- Added central constants in `lib/summarizer.ts` for easier tuning:
  - `OPENAI_MODEL`
  - `OPENAI_TIMEOUT_MS`
  - `MIN_SUMMARY_LENGTH`
  - `MAX_SUMMARY_LENGTH`

### No-Key (Free) Summarization Optimization

- Replaced static template mock summary with a local extractive summarizer.
- Local summarization flow:
  1. sanitize and normalize text
  2. split into sentences
  3. tokenize and remove stop words
  4. compute token frequency scores
  5. apply slight position bias for context preservation
  6. select top-ranked sentences and clip to max summary length

Result: meaningful, document-specific summaries even without `OPENAI_API_KEY`.

## Feature Enhancements Implemented

### 1) File Upload and Parsing

- Added upload endpoint: `app/api/extract-text/route.ts`
- Added upload UI in: `components/summarizer-client.tsx`
- Supported formats:
  - `.txt`
  - `.csv`
  - `.docx`
- Validation and safeguards:
  - file size limit: 5MB
  - unsupported file type rejection
  - empty extraction handling
  - robust API error responses

### 2) Word Document Support

- Added `mammoth` integration for `.docx` extraction.
- Added UTF-8 BOM cleanup and output normalization before summarization.

### 3) Runtime Optimizations

- Reused one OpenAI client instance (avoids per-request re-instantiation).
- Improved timeout handling by clearing timeout resources after `Promise.race`.
- Preserved validation guardrails:
  - summary length checks
  - similarity threshold checks
  - safe sentence fallback if output validation fails

## TDD Implementation (Test-Driven Setup)

### Testing Stack Added

- Added `vitest` as test framework.
- Added scripts in `package.json`:
  - `npm run test`
  - `npm run test:watch`
- Added `vitest.config.ts` with:
  - Node test environment
  - alias support for `@`
  - stable worker settings for this environment

### Test Cases Implemented

#### `lib/summarizer.test.ts`

- `sanitizeInput` removes script tags and normalizes whitespace.
- `sanitizeInput` enforces max input length (`12_000`).
- `summarizeDocument` handles missing API key path safely.
- `summarizeDocument` returns proper fallback on empty input.

#### `app/api/extract-text/route.test.ts`

- accepts and extracts text from valid `.csv` upload.
- rejects unsupported file types with proper `400` response.

### Quality Gates Run

- `npm run test` -> passing
- `npm run lint` -> passing

## Current Behavior Summary

- With `OPENAI_API_KEY`:
  - app uses OpenAI summarization (`gpt-4.1-mini`) with timeout and validation.
- Without `OPENAI_API_KEY`:
  - app uses free local extractive summarization (no paid API required).

This keeps the app production-usable while also being developer-friendly for no-key testing and TDD workflow.
