# SaaS Document Summarizer

Production-grade document summarization app built with Next.js App Router (v16), React 19, Tailwind CSS, and shadcn-style UI components.

## Features

- OpenAI integration using `OPENAI_API_KEY` (`gpt-3.5-turbo`)
- Mock summarization with realistic output when API key is missing (200ms delay)
- Input sanitization (`<script>` tag removal)
- 10-second timeout handling for model calls
- Error handling for network/rate-limit/auth/API failures
- Output validation (length, non-empty, similarity threshold)
- Automatic fallback summary:
  - uses first 2 sentences
  - max 300 chars
  - prefixed with `[Fallback summary]`
- Structured JSON logging per request:
  - `timestamp`
  - `inputLength`
  - `outputLength`
  - `responseTime`
  - `success`
  - `fallbackUsed`
  - `tokenEstimate`
- In-memory rate limit: max 5 requests/minute per IP
- SaaS-quality UI:
  - gradient background + glassmorphism card
  - dark/light mode (`next-themes`)
  - file uploads for TXT, CSV, and DOCX documents
  - loading spinner + skeleton states
  - toast notifications for warnings/errors
  - mobile-first responsive layout

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

`OPENAI_API_KEY` is optional. If not provided, the app uses a mocked summary and notifies the user.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## TDD Workflow

Use the built-in tests to work in a red-green-refactor loop:

```bash
npm run test
```

Watch mode while developing:

```bash
npm run test:watch
```

Current test coverage focuses on:

- summarizer sanitization and no-key fallback behavior
- upload extraction route validation for supported/unsupported files

## Build for Production

```bash
npm run build
npm start
```

## API

- Endpoint: `POST /api/summarize`
- Body: `{ "input": "your document text" }`
- Returns: `{ summary, fallbackUsed, warning, usedMock }`
