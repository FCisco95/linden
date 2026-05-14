# Examples

Synthetic CV / JD pairs for testing `evaluate()`. All names, companies, and details are fictional. No real PII.

Pairs are plain `.txt` — provider-agnostic. Same fixtures run against `AnthropicProvider` or `OpenAIProvider` unchanged.

| # | Folder | Archetype | Language |
|---|---|---|---|
| 01 | `01-strong-en` | Strong match | EN |
| 02 | `02-weak-en` | Weak match | EN |
| 03 | `03-gap-en` | Big skills gap | EN |
| 04 | `04-career-changer-en` | Career changer (eng → PM) | EN |
| 05 | `05-strong-pt` | Strong match | PT |
| 06 | `06-junior-pt` | Junior applying for senior role | PT |
| 07 | `07-senior-pt` | Senior overqualified for mid-level role | PT |
| 08 | `08-weak-es` | Weak match | ES |
| 09 | `09-junior-es` | Junior for junior role (strong match) | ES |
| 10 | `10-senior-es` | Senior for director role | ES |

## Run one

```sh
export ANTHROPIC_API_KEY=sk-ant-...
pnpm eval -- --cv examples/01-strong-en/cv.txt --jd examples/01-strong-en/jd.txt --language en
```

Or with OpenAI:

```sh
export OPENAI_API_KEY=sk-...
pnpm eval -- --cv examples/05-strong-pt/cv.txt --jd examples/05-strong-pt/jd.txt --language pt --provider openai
```
