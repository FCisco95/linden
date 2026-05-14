import { z } from "zod";

export const MatchResultSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    one_line_verdict: z.string().min(1).max(80),
    matched_skills: z.array(z.string().min(1)),
    gaps: z.array(z.string().min(1)),
    risk_flags: z.array(z.string().min(1)),
    suggested_questions: z.array(z.string().min(1)).min(3).max(5),
    recruiter_next_steps: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type MatchResult = z.infer<typeof MatchResultSchema>;
