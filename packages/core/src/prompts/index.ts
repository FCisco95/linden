import type { Language } from "../rejection-verbs.js";
import { buildSystemPromptEn } from "./en.js";
import { buildSystemPromptPt } from "./pt.js";
import { buildSystemPromptEs } from "./es.js";

export function buildSystemPrompt(jd: string, language: Language = "en"): string {
  switch (language) {
    case "en":
      return buildSystemPromptEn(jd);
    case "pt":
      return buildSystemPromptPt(jd);
    case "es":
      return buildSystemPromptEs(jd);
  }
}

export { buildSystemPromptEn, buildSystemPromptPt, buildSystemPromptEs };
