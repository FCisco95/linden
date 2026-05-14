import { describe, it, expect } from "vitest";
import {
  REJECTION_VERBS,
  containsRejectionVerb,
  type Language,
} from "../src/rejection-verbs.js";
import { buildSystemPrompt } from "../src/prompts/index.js";

// 12 hand-written low-score MatchResult fixtures across the 6 archetypes × 3 languages.
// Each fixture's recruiter_next_steps MUST be safe (no rejection verbs).
const lowScoreFixtures: Array<{
  archetype: string;
  language: Language;
  recruiter_next_steps: string[];
}> = [
  // EN
  {
    archetype: "weak-match",
    language: "en",
    recruiter_next_steps: [
      "Phone screen to clarify the gap on distributed systems",
      "Ask for a portfolio sample focused on payment integrations",
      "Consider for a more junior opening if available",
    ],
  },
  {
    archetype: "big-gap",
    language: "en",
    recruiter_next_steps: [
      "Reference check on the 2020-2022 career break before scheduling further interviews",
      "Pass to hiring manager for domain judgement",
    ],
  },
  {
    archetype: "junior-overshoot",
    language: "en",
    recruiter_next_steps: [
      "Hold for a junior-level requisition currently in draft",
      "Short call to confirm seniority signals from the CV",
    ],
  },
  {
    archetype: "career-changer",
    language: "en",
    recruiter_next_steps: [
      "30-minute exploratory chat to understand motivation for the switch",
      "Share the hiring manager's bar-raiser questions to assess fit",
    ],
  },
  // PT
  {
    archetype: "fraco-match",
    language: "pt",
    recruiter_next_steps: [
      "Entrevista telefónica curta para clarificar a falta de experiência em microsserviços",
      "Pedir exemplo de portfólio focado em integrações de pagamento",
      "Considerar para abertura mais júnior se existir",
    ],
  },
  {
    archetype: "lacuna-grande",
    language: "pt",
    recruiter_next_steps: [
      "Verificar referências sobre o intervalo de carreira 2020-2022 antes de avançar com entrevistas",
      "Encaminhar para hiring manager para avaliação técnica",
    ],
  },
  {
    archetype: "senior-overshoot",
    language: "pt",
    recruiter_next_steps: [
      "Manter em consideração para vaga mais sénior em aberto",
      "Chamada curta para confirmar expectativas salariais e de senioridade",
    ],
  },
  {
    archetype: "mudanca-carreira",
    language: "pt",
    recruiter_next_steps: [
      "Conversa exploratória de 30 minutos para perceber motivação da mudança",
      "Partilhar perguntas técnicas do hiring manager para avaliar fit",
    ],
  },
  // ES
  {
    archetype: "match-flojo",
    language: "es",
    recruiter_next_steps: [
      "Llamada corta para aclarar el hueco en sistemas distribuidos",
      "Pedir muestra de portafolio enfocada en integraciones de pago",
      "Considerar para vacante junior si está abierta",
    ],
  },
  {
    archetype: "hueco-grande",
    language: "es",
    recruiter_next_steps: [
      "Verificar referencias sobre el periodo 2020-2022 antes de programar más entrevistas",
      "Pasar al hiring manager para juicio de dominio",
    ],
  },
  {
    archetype: "junior-sobrecualificado",
    language: "es",
    recruiter_next_steps: [
      "Mantener en consideración para una vacante junior próxima a abrir",
      "Llamada corta para confirmar señales de seniority del CV",
    ],
  },
  {
    archetype: "cambio-carrera",
    language: "es",
    recruiter_next_steps: [
      "Charla exploratoria de 30 minutos para entender la motivación del cambio",
      "Compartir las preguntas del hiring manager para evaluar fit",
    ],
  },
];

describe("REJECTION_VERBS", () => {
  it("contains entries for all three languages", () => {
    expect(REJECTION_VERBS.en.length).toBeGreaterThanOrEqual(10);
    expect(REJECTION_VERBS.pt.length).toBeGreaterThanOrEqual(10);
    expect(REJECTION_VERBS.es.length).toBeGreaterThanOrEqual(8);
  });
});

describe("containsRejectionVerb — load-bearing safety net", () => {
  it.each(lowScoreFixtures)(
    "[$language/$archetype] every recruiter_next_step is rejection-free",
    ({ recruiter_next_steps }) => {
      for (const step of recruiter_next_steps) {
        expect(
          containsRejectionVerb(step),
          `offending step: "${step}"`,
        ).toBe(false);
      }
    },
  );

  // Positive controls — these MUST flag.
  it.each([
    ["en", "We should reject this candidate"],
    ["en", "Decline and move on"],
    ["en", "Disqualify based on missing requirements"],
    ["en", "Not a fit for this team"],
    ["en", "Drop from the pipeline"],
    ["pt", "Devemos rejeitar este candidato"],
    ["pt", "Recusar e seguir em frente"],
    ["pt", "Não avançar com este candidato"],
    ["pt", "Candidato inadequado para a vaga"],
    ["es", "Hay que rechazar a este candidato"],
    ["es", "Descartar y seguir adelante"],
    ["es", "No avanzar con este candidato"],
    ["es", "Candidato inadecuado para el puesto"],
  ])(
    "[%s] flags rejection phrasing: %s",
    (_lang, phrase) => {
      expect(containsRejectionVerb(phrase)).toBe(true);
    },
  );

  // Negative controls — superficially similar phrases that must NOT be flagged.
  it.each([
    "Phone screen to clarify a specific gap",
    "Schedule an interview to discuss the candidate's experience",
    "Pasar a la siguiente fase de entrevistas",
    "Passar à próxima fase do processo",
    "Reference check on tenure",
  ])("does not flag neutral phrasing: %s", (phrase) => {
    expect(containsRejectionVerb(phrase)).toBe(false);
  });
});

describe("buildSystemPrompt — constraint embedded inline", () => {
  it.each(["en", "pt", "es"] as Language[])(
    "[%s] embeds the rejection verb list inside the system prompt",
    (lang) => {
      const prompt = buildSystemPrompt("JOB DESCRIPTION HERE", lang);
      const verbs = REJECTION_VERBS[lang];
      for (const verb of verbs) {
        expect(prompt.toLowerCase()).toContain(verb.toLowerCase());
      }
    },
  );

  it.each(["en", "pt", "es"] as Language[])(
    "[%s] inlines the JD into the system block (so it's cached together)",
    (lang) => {
      const jd = "UNIQUE_JD_MARKER_98237";
      const prompt = buildSystemPrompt(jd, lang);
      expect(prompt).toContain(jd);
    },
  );
});
