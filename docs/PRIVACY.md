# Privacy

Linden is designed so that **the developer never sees your data, and there is no third-party backend involved.**

---

## What data Linden handles

| Data | Where it lives | Who sees it |
|---|---|---|
| Your API key | `chrome.storage.local` in your browser | Only you |
| Job Description text | In-memory only (cleared on close) | You + your chosen LLM provider |
| CV text (parsed from PDF/DOCX) | In-memory only (cleared on close) | You + your chosen LLM provider |
| Match results | In-memory only (v1); `chrome.storage.local` in v1.1 with explicit opt-in | Only you |

---

## What Linden does NOT do

- ❌ No backend server — the extension is fully client-side
- ❌ No telemetry, analytics, or usage tracking in v1
- ❌ No third-party services beyond your chosen LLM provider
- ❌ No data sent to the developer
- ❌ No API key sync across devices (`chrome.storage.sync` is never used)
- ❌ No automatic decision-making about candidates — Linden never auto-rejects

---

## Data flow

```
Your browser ──► Anthropic API (or OpenAI API) ──► Back to your browser
                  (using YOUR API key)
```

That's it. Nothing else.

---

## LLM provider privacy

Your CV and JD text are sent to the LLM provider you choose, authenticated with **your** API key. The provider's privacy policy applies:

- **Anthropic**: API inputs/outputs are not used for training by default. Enterprise Zero Data Retention available. See [Anthropic Privacy](https://www.anthropic.com/legal/privacy).
- **OpenAI**: API inputs/outputs are not used for training as of March 2023. See [OpenAI API data usage](https://platform.openai.com/docs/models/how-we-use-your-data).

If you're concerned about LLM provider data handling, **don't paste data you wouldn't already be comfortable sending to that provider through their playground.**

---

## GDPR / EU users

You are the data controller for any CV data you process through Linden. The developer of Linden is not a data processor — Linden is a tool you run locally, not a service you connect to.

**Your obligations as the recruiter** (not Linden's):
- Inform candidates that AI is used in the screening process
- Document the decision logic (Linden's role is advisory only — humans decide)
- If you process CVs at scale, consult your DPO about whether a DPIA is needed
- Be aware that the EU AI Act (effective Aug 2026) classifies AI used to evaluate candidates as high-risk, with documentation and human-oversight obligations

Linden's "advisory only, never auto-reject" design is intended to support these obligations, not to provide legal cover.

---

## Reporting privacy issues

If you spot a privacy issue, please open a GitHub issue with `[privacy]` in the title.

---

*Last updated: 2026-05-13*
