export type Language = "en" | "pt" | "es";

export const REJECTION_VERBS: Record<Language, readonly string[]> = {
  en: [
    "reject",
    "decline",
    "dismiss",
    "eliminate",
    "disqualify",
    "drop",
    "skip",
    "discard",
    "screen out",
    "pass on",
    "rule out",
    "turn down",
    "do not advance",
    "not move forward",
    "won't proceed",
    "not a fit",
    "not a match",
    "not suitable",
    "not qualified",
    "unsuitable",
    "unfit",
    "unqualified",
    "poor fit",
    "no-go",
  ],
  pt: [
    "rejeitar",
    "recusar",
    "descartar",
    "eliminar",
    "desqualificar",
    "dispensar",
    "não avançar",
    "não prosseguir",
    "não adequado",
    "inadequado",
    "não serve",
    "não convém",
  ],
  es: [
    "rechazar",
    "descartar",
    "eliminar",
    "descalificar",
    "desestimar",
    "prescindir",
    "no avanzar",
    "no continuar",
    "no adecuado",
    "inadecuado",
    "no apto",
  ],
};

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPattern = (verbs: readonly string[]): RegExp => {
  const alternatives = verbs.map(escapeRegex).join("|");
  return new RegExp(`(?<![\\p{L}])(?:${alternatives})(?![\\p{L}])`, "iu");
};

const PATTERNS: Record<Language, RegExp> = {
  en: buildPattern(REJECTION_VERBS.en),
  pt: buildPattern(REJECTION_VERBS.pt),
  es: buildPattern(REJECTION_VERBS.es),
};

export function containsRejectionVerb(text: string, language?: Language): boolean {
  const languages: Language[] = language ? [language] : ["en", "pt", "es"];
  return languages.some((lang) => PATTERNS[lang].test(text));
}

export class RejectionVerbViolation extends Error {
  constructor(
    public readonly offendingStep: string,
    public readonly language: Language,
  ) {
    super(
      `recruiter_next_steps must never contain rejection verbs. Offending entry (${language}): "${offendingStep}"`,
    );
    this.name = "RejectionVerbViolation";
  }
}
