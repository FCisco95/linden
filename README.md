# Linden

> **A browser extension that helps recruiters score multiple CVs against a single Job Description — fast, transparent, and never on autopilot.**

Linden surfaces the match breakdown, the gaps, and suggested interview questions. The recruiter decides everything else. By design, Linden **never auto-rejects a candidate**.

---

## Status

**Pre-MVP — workspace set up.** No installable build yet. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the phased build plan.

---

## Principles

1. **Human-in-the-loop, always.** Linden advises. The recruiter decides. There is no "reject" verb in the output schema.
2. **Bring your own API key.** You supply your Anthropic (or OpenAI) key. Your CV data flows browser → provider. Nothing routes through a third-party backend.
3. **Privacy by absence.** No telemetry, no analytics, no shared backend in v1. See [`docs/PRIVACY.md`](docs/PRIVACY.md).
4. **Open source.** MIT licensed. Audit anything.

---

## What v1 will do

- Paste a Job Description into the extension side-panel
- Drag-and-drop multiple CVs (PDF or DOCX)
- Get a scored table: candidate · score · one-line reason
- Click any row for full breakdown: matched skills, gaps, risk flags, suggested interview questions

What v1 **won't** do: auto-detect JDs on LinkedIn/Greenhouse/Lever (planned for v2), evaluation history sync, team workspaces, custom rubrics. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Tech stack

TypeScript · React · Vite + CRXJS · Tailwind · pnpm workspaces · pdf.js · mammoth.js · Zod · `@anthropic-ai/sdk` · `openai` · Vitest

Full architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Repo layout

```
linden/
├── packages/
│   ├── core/        # Pure TS evaluation skill. Reusable from Node or browser.
│   ├── providers/   # Anthropic + OpenAI adapters behind one interface.
│   └── extension/   # React + Vite + CRXJS browser extension.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── PRIVACY.md
│   └── API_KEY_GUIDE.md
└── examples/        # Synthetic CV/JD pairs for testing. No real PII.
```

---

## License

[MIT](LICENSE) — © 2026 João Francisco Vieira
