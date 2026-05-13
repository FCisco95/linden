# Architecture

Linden is a pnpm monorepo with three packages and one explicit principle: **the evaluation logic is reusable outside the extension.** Everything else follows from that.

---

## Package layout

```
packages/
├── core/        # Pure TypeScript. Zero browser/Node assumptions.
├── providers/   # LLM adapters: Anthropic, OpenAI (later: Gemini, etc.)
└── extension/   # React + Vite + CRXJS. The browser UI. Consumes core + providers.
```

### `packages/core/`

Exports one primary function:

```ts
async function evaluate(input: EvaluateInput): Promise<MatchResult>
```

- `EvaluateInput`: `{ cv: string, jd: string, provider: Provider, model?: string, language?: 'en' | 'pt' }`
- `MatchResult`: structured output (see schema below), Zod-validated
- Pure logic — no fetch, no fs, no DOM. The provider object passed in handles the actual LLM call.

Why isolate this: the same function powers (a) the extension, (b) a CLI runner for prompt testing, (c) future Node integrations (e.g. Cisco's Resume Automation idea), (d) any future server-side mode.

### `packages/providers/`

A single `Provider` interface:

```ts
interface Provider {
  name: 'anthropic' | 'openai'
  complete(opts: { system: string, user: string, schema: ZodSchema }): Promise<unknown>
}
```

Implementations:
- `AnthropicProvider` — uses `@anthropic-ai/sdk`, Sonnet 4.6 default, structured outputs via the `anthropic-beta: structured-outputs-2025-11-13` header.
- `OpenAIProvider` — uses `openai` SDK, `gpt-4o` or equivalent default, structured outputs via `response_format: { type: 'json_schema' }`.

Adding a third provider = one new file implementing the interface. No core changes.

### `packages/extension/`

- Manifest V3 Chrome/Edge extension (MV2 dead June 2025)
- Side-panel UI (not popup — batch results need vertical real estate)
- React 18 + Tailwind for fast iteration
- Vite + CRXJS for the build (hot reload, proper MV3 service-worker handling)
- `chrome.storage.local` for API key storage (never `chrome.storage.sync` — keys must not roam)

---

## The evaluation schema (load-bearing)

The `MatchResult` shape is the contract everything else builds on. Lock this early.

```ts
{
  score: number,                       // 0-100
  one_line_verdict: string,            // ≤ 80 chars — for the table row
  matched_skills: string[],            // overlap surfaced from CV ∩ JD
  gaps: string[],                      // explicit misses
  risk_flags: string[],                // e.g. "career gap 2020-2022", "domain mismatch"
  suggested_questions: string[],       // 3-5 questions for next interview phase
  recruiter_next_steps: string[],      // ranked options — NEVER includes "reject"
}
```

**Hard constraint in the prompt:** `recruiter_next_steps` must never contain a rejection verb. Unit tests will assert this on a battery of synthetic low-score CVs.

---

## Data flow (v1, BYO key)

```
[ Recruiter pastes JD ]
[ Recruiter drops N CVs ]
        │
        ▼
[ Extension parses PDFs/DOCX in-browser ]   ← pdf.js, mammoth.js
        │
        ▼
[ Extension calls core.evaluate() per CV ]   ← parallel, with concurrency limit
        │
        ▼
[ Provider sends to Claude/OpenAI directly ]   ← user's API key, browser → provider
        │
        ▼
[ Validated MatchResult per CV ]
        │
        ▼
[ React table renders results ]
```

**Zero backend.** No proxy, no server, no Vercel, no Cloudflare. The extension is fully client-side. The user's API key never leaves their browser except in calls to the provider they chose.

This is the design that lets Cisco hand the friend a working tool without becoming a hosted-service operator.

---

## Cost optimization: prompt caching

The JD is reused across every CV in a screening session. Strong candidate for Anthropic prompt caching:

- Cache breakpoint after `system + jd` block (≥ 1024 tokens for Sonnet)
- Per-CV call: cache hit on JD, fresh tokens only for the CV body
- ~90% input-cost reduction on the JD portion after the first call in a 5-minute window

Important nuance with BYO key: the cache is scoped to the **user's** Anthropic account, not ours. Still works — but means the first CV in a session pays the cache-write cost.

OpenAI auto-caches identical prefixes ≥ 1024 tokens, no explicit markup needed.

---

## Document parsing

| Format | Library | Notes |
|---|---|---|
| PDF (text) | `pdfjs-dist` | Use `getTextContent()` per page. Concatenate with newlines. |
| DOCX | `mammoth` | `mammoth.browser.js`, call `extractRawText()`. |
| PDF (scanned) | — | v1: reject with a clear "scanned PDF not supported" message. OCR (Tesseract.js) deferred. |
| Other | — | Reject with format-not-supported. |

Parse client-side. Send plain text to the provider. Never send the raw file.

---

## Privacy posture (summary — full in `PRIVACY.md`)

- **No backend, no telemetry, no analytics in v1**
- API key stored in `chrome.storage.local` only
- CV text held in extension memory only, cleared on close
- Explicit on-screen privacy notice before first run
- Documented for end-users in plain language

---

## What's intentionally NOT in v1

These are real future work, registered in `ROADMAP.md`. Listing here so the architecture leaves room for them:

- **Auto-detect JD from ATS pages** (LinkedIn Recruiter, Greenhouse, Lever, Workday) — content scripts, deferred
- **Evaluation history** — `chrome.storage.local` schema for past runs, in v1.1
- **Custom rubrics per role family** — templating layer on the prompt
- **B2B SaaS proxy mode** — optional hosted backend for orgs that won't put keys in browsers. Architecturally clean: same `core` + new `RemoteProvider` implementation.

---

## Key decisions (locked 2026-05-13)

| # | Decision | Why |
|---|---|---|
| 1 | Monorepo with `core` / `providers` / `extension` split | Evaluation logic reusable beyond the extension (Resume Automation, future CLI, future SaaS). |
| 2 | BYO API key, zero backend in v1 | No babysitting infrastructure, no API key liability, no GDPR processor agreements. |
| 3 | Side-panel UI, not popup | Batch results need vertical space. Side-panel persists across page changes. |
| 4 | Anthropic-only for Phase 1, OpenAI added in Phase 2 | Ship core skill faster. Multi-provider is a marketing win, not a v0 requirement. |
| 5 | Manifest V3, Chrome + Edge target | Only MV3 is alive post June 2025. Edge auto-installs Chrome extensions. |
| 6 | MIT license, public from day 1 | Open-source from the start. No private→public flip needed. |
| 7 | Zod-validated structured outputs | Compile-time + runtime safety on the LLM response shape. |
