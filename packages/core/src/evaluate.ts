import { MatchResultSchema, type MatchResult } from "./schema.js";
import { buildSystemPrompt } from "./prompts/index.js";
import { containsRejectionVerb, RejectionVerbViolation } from "./rejection-verbs.js";
import type { EvaluateInput, Language } from "./types.js";

export async function evaluate(input: EvaluateInput): Promise<MatchResult> {
  const language: Language = input.language ?? "en";
  const system = buildSystemPrompt(input.jd, language);

  const raw = await input.provider.complete({
    system,
    user: input.cv,
    schema: MatchResultSchema,
  });

  const result = MatchResultSchema.parse(raw);

  for (const step of result.recruiter_next_steps) {
    if (containsRejectionVerb(step)) {
      throw new RejectionVerbViolation(step, language);
    }
  }

  return result;
}
