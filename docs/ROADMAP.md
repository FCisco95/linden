# Roadmap

A living document. Phases 0–3 are scoped; everything below "Future" is registered, not committed.

---

## Phase 0 — Workspace (✅ done 2026-05-13)
- Repo created, public, MIT
- Folder layout, docs, license, .gitignore
- No code yet

## Phase 1 — Core evaluation skill (✅ scaffolded 2026-05-13; live smoke test pending)

**Goal: a working `evaluate()` function tested on 10 real CV/JD pairs from the CLI, before any UI exists.**

- ✅ `packages/core/`: `evaluate()` + Zod schema for `MatchResult`
- ✅ `packages/providers/`: `AnthropicProvider` **and** `OpenAIProvider` (OpenAI pulled forward from Phase 2 — friend may have either key)
- ✅ Prompt design — English, Portuguese **and Spanish** variants (ES pulled forward; was originally future)
- ✅ Hard constraint: `recruiter_next_steps` never contains rejection verbs — embedded inline in each system prompt + `RejectionVerbViolation` defense-in-depth in `evaluate()` + 12 negative-fixture unit tests across EN/PT/ES (59 tests total, all green)
- ✅ CLI runner: `pnpm eval -- --cv path --jd path --language en|pt|es --provider anthropic|openai`
- ✅ 10 synthetic CV/JD pairs in `examples/` covering strong / weak / gap / junior / senior / career-changer (4 EN + 3 PT + 3 ES)
- ⏳ Live smoke test against a real API key — needs human judgement on whether the outputs feel right

**Done when:** Cisco's friend (or Cisco) can run the CLI on 10 pairs and the outputs feel right.

## Phase 2 — Extension MVP (target: week of 2026-05-26)
- Vite + CRXJS + React + Tailwind scaffold
- Side-panel UI: JD textarea + drag-drop CVs + results table + expandable rows
- Onboarding: first-run API key prompt with deep links to Anthropic/OpenAI consoles
- Settings page: key management, model selection
- Add `OpenAIProvider` (matches the BYO key story — recruiters can pick their provider)
- Privacy notice modal on first run
- Local dev install instructions in README

**Done when:** Cisco's friend can install from a `dist/` folder, paste a JD, drop 5 CVs, and get a useful table.

## Phase 3 — Polish + ship (target: week of 2026-06-02)
- CSV export of results
- Evaluation history in `chrome.storage.local` (last 50 runs)
- Chrome Web Store submission package + screenshots
- Edge Add-ons listing
- README screenshots, demo GIF
- `docs/API_KEY_GUIDE.md` filled out with screenshots

**Done when:** publicly installable from Chrome Web Store.

---

## Future (registered, not scheduled)

### Higher-impact next moves
- [ ] **LinkedIn Recruiter auto-detect** — content script that reads JD from the page, populates the side-panel automatically. Biggest single time-saver. Watch ToS.
- [ ] **Greenhouse / Lever / Workday auto-detect** — same pattern, more ATSes
- [ ] **Custom rubrics per role family** — recruiter saves "Senior Backend Engineer" rubric, applies it per JD
- [ ] **Folder import** — drop a folder, parse all PDFs/DOCX inside, batch evaluate
- [ ] **PT / EN / ES multilingual prompt set** — JD and CV in different languages, results in recruiter's language
- [ ] **Question quality tuned to gaps** — questions auto-targeted at the gaps surfaced for that candidate

### Workflow features
- [ ] Re-rank: compare two saved evaluations side-by-side
- [ ] Notes per candidate (recruiter scratchpad inside the row)
- [ ] Share evaluation via link (signed, expires) — for handing off to a hiring manager
- [ ] Export to ATS-friendly note format (Greenhouse note JSON, Lever note JSON)

### Commercial path (B2B SaaS)
- [ ] **Team workspace mode** — shared rubrics, shared evaluation history, role-based access
- [ ] **Hosted proxy mode** — optional backend for orgs that won't allow API keys in browsers. Full DPA, EU hosting, ZDR with Anthropic.
- [ ] **EU AI Act compliance pack** — DPIA template, transparency notice template, decision-log export
- [ ] **Billing + per-seat pricing**
- [ ] **SSO** (SAML, Google Workspace)

### Technical debt to revisit
- [ ] **OCR for scanned PDFs** (Tesseract.js or call out to a service) — currently rejected
- [ ] **Telemetry — opt-in only, anonymous** — only if there's a real product reason
- [ ] **Prompt versioning** — track which prompt version produced which result for reproducibility

---

## Brand / product decisions to revisit
- [ ] Domain registration: `linden.hr`, `getlinden.com`, `uselinden.com` — pick one before launch
- [ ] Logo + visual identity — defer until Phase 3
- [ ] Twitter / LinkedIn presence — only if going public-beta
