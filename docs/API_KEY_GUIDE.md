# Getting an API Key

Linden needs an API key from either **Anthropic (Claude)** or **OpenAI (GPT)** to work. Both work well. You only need one.

> **Cost expectation**: At normal recruiter volume (~50 CVs/day, Claude Sonnet 4.6 with prompt caching), expect ~$2–5/month in API costs. You pay the provider directly; Linden takes nothing.

---

## Option 1 — Anthropic (Claude) — recommended

Claude Sonnet 4.6 is the default model Linden uses.

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Add a payment method (Settings → Billing)
4. Go to **Settings → API Keys → Create Key**
5. Copy the key (starts with `sk-ant-...`)
6. Paste it into Linden when prompted

📸 *Screenshots coming in Phase 3.*

---

## Option 2 — OpenAI (GPT)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Add a payment method (Settings → Billing)
4. Go to **API Keys → Create new secret key**
5. Copy the key (starts with `sk-...`)
6. Paste it into Linden when prompted

📸 *Screenshots coming in Phase 3.*

---

## Where Linden stores your key

- In `chrome.storage.local` — only on your machine, only this browser profile
- Never synced across devices
- Never sent to any server other than the LLM provider you chose
- You can remove the key any time in Linden's Settings

---

## Troubleshooting

**"Invalid API key"** — Double-check you copied the full key. Anthropic keys start with `sk-ant-`, OpenAI keys start with `sk-`.

**"Insufficient credits"** — Add credit / a payment method in your provider's console.

**"Rate limit"** — You've hit the provider's per-minute limit. Wait a moment and retry. If it persists, your provider account may need a higher tier.

---

*If you get stuck, open a GitHub issue.*
