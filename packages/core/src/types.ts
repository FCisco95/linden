import type { ZodSchema } from "zod";
import type { Language } from "./rejection-verbs.js";

export type { Language } from "./rejection-verbs.js";

export interface Provider {
  readonly name: "anthropic" | "openai";
  complete(opts: { system: string; user: string; schema: ZodSchema }): Promise<unknown>;
}

export interface EvaluateInput {
  cv: string;
  jd: string;
  provider: Provider;
  language?: Language;
  model?: string;
}
