import { describe, it, expect } from "vitest";
import { MatchResultSchema } from "../src/schema.js";

const valid = {
  score: 78,
  one_line_verdict: "Strong on backend, light on infra leadership.",
  matched_skills: ["Go", "Postgres", "gRPC"],
  gaps: ["Kubernetes at scale", "team leadership"],
  risk_flags: ["short tenure at last role"],
  suggested_questions: [
    "What's the largest cluster you've operated?",
    "Tell me about a leadership moment.",
    "How do you approach gRPC versioning?",
  ],
  recruiter_next_steps: ["Phone screen on infra depth", "Reference check on tenure"],
};

describe("MatchResultSchema", () => {
  it("accepts a valid result", () => {
    expect(() => MatchResultSchema.parse(valid)).not.toThrow();
  });

  it("rejects extra fields", () => {
    expect(() =>
      MatchResultSchema.parse({ ...valid, extra: "boom" }),
    ).toThrow();
  });

  it("rejects score out of range", () => {
    expect(() => MatchResultSchema.parse({ ...valid, score: 101 })).toThrow();
    expect(() => MatchResultSchema.parse({ ...valid, score: -1 })).toThrow();
    expect(() => MatchResultSchema.parse({ ...valid, score: 75.5 })).toThrow();
  });

  it("rejects verdict longer than 80 chars", () => {
    expect(() =>
      MatchResultSchema.parse({ ...valid, one_line_verdict: "x".repeat(81) }),
    ).toThrow();
  });

  it("rejects empty recruiter_next_steps", () => {
    expect(() =>
      MatchResultSchema.parse({ ...valid, recruiter_next_steps: [] }),
    ).toThrow();
  });

  it("requires 3-5 suggested_questions", () => {
    expect(() =>
      MatchResultSchema.parse({ ...valid, suggested_questions: ["q1", "q2"] }),
    ).toThrow();
    expect(() =>
      MatchResultSchema.parse({
        ...valid,
        suggested_questions: ["1", "2", "3", "4", "5", "6"],
      }),
    ).toThrow();
  });
});
