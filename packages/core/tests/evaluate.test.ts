import { describe, it, expect, vi } from "vitest";
import { evaluate } from "../src/evaluate.js";
import { RejectionVerbViolation } from "../src/rejection-verbs.js";
import type { Provider } from "../src/types.js";

const okResult = {
  score: 72,
  one_line_verdict: "Solid backend match, light on infra.",
  matched_skills: ["TypeScript", "Postgres"],
  gaps: ["Terraform"],
  risk_flags: ["short tenure"],
  suggested_questions: [
    "Walk me through your largest production incident.",
    "How do you approach schema migrations?",
    "What's missing from your infra toolkit today?",
  ],
  recruiter_next_steps: [
    "Phone screen to probe infra depth",
    "Reference check on tenure",
  ],
};

const stubProvider = (response: unknown): Provider => ({
  name: "anthropic",
  complete: vi.fn(async () => response),
});

describe("evaluate", () => {
  it("returns a parsed MatchResult on the happy path", async () => {
    const result = await evaluate({
      cv: "Some CV text",
      jd: "Some JD text",
      provider: stubProvider(okResult),
    });
    expect(result.score).toBe(72);
    expect(result.recruiter_next_steps).toHaveLength(2);
  });

  it("passes the right system + user payload to the provider", async () => {
    const provider = stubProvider(okResult);
    await evaluate({
      cv: "CV_BODY_MARKER",
      jd: "JD_BODY_MARKER",
      provider,
      language: "en",
    });
    expect(provider.complete).toHaveBeenCalledOnce();
    const callArg = (provider.complete as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(callArg.system).toContain("JD_BODY_MARKER");
    expect(callArg.user).toBe("CV_BODY_MARKER");
  });

  it("throws RejectionVerbViolation when the model sneaks rejection language past Zod", async () => {
    const bad = {
      ...okResult,
      recruiter_next_steps: [
        "Phone screen on infra depth",
        "We should reject this candidate after the call",
      ],
    };
    await expect(
      evaluate({
        cv: "x",
        jd: "y",
        provider: stubProvider(bad),
      }),
    ).rejects.toBeInstanceOf(RejectionVerbViolation);
  });

  it("throws Zod error on a malformed response", async () => {
    const malformed = { score: "high" };
    await expect(
      evaluate({
        cv: "x",
        jd: "y",
        provider: stubProvider(malformed),
      }),
    ).rejects.toThrow();
  });
});
