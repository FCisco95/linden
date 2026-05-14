#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { evaluate, type Language, type Provider } from "@linden/core";
import { AnthropicProvider, OpenAIProvider } from "@linden/providers";

interface CliOptions {
  cv: string;
  jd: string;
  language: Language;
  provider: "anthropic" | "openai";
  model?: string;
}

function die(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

function parseCliArgs(argv: string[]): CliOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      cv: { type: "string" },
      jd: { type: "string" },
      language: { type: "string", default: "en" },
      provider: { type: "string", default: "anthropic" },
      model: { type: "string" },
    },
    strict: true,
  });

  if (!values.cv) die("--cv <path> is required");
  if (!values.jd) die("--jd <path> is required");

  const language = values.language as string;
  if (language !== "en" && language !== "pt" && language !== "es") {
    die(`--language must be one of: en, pt, es (got "${language}")`);
  }

  const provider = values.provider as string;
  if (provider !== "anthropic" && provider !== "openai") {
    die(`--provider must be one of: anthropic, openai (got "${provider}")`);
  }

  return {
    cv: values.cv,
    jd: values.jd,
    language,
    provider,
    ...(values.model ? { model: values.model } : {}),
  };
}

function buildProvider(opts: CliOptions): Provider {
  if (opts.provider === "anthropic") {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      die("ANTHROPIC_API_KEY is not set. Get one at https://console.anthropic.com/");
    }
    return new AnthropicProvider({
      apiKey,
      ...(opts.model ? { model: opts.model } : {}),
    });
  }
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    die("OPENAI_API_KEY is not set. Get one at https://platform.openai.com/api-keys");
  }
  return new OpenAIProvider({
    apiKey,
    ...(opts.model ? { model: opts.model } : {}),
  });
}

async function main(): Promise<void> {
  const opts = parseCliArgs(process.argv.slice(2));
  const [cvText, jdText] = await Promise.all([
    readFile(opts.cv, "utf8"),
    readFile(opts.jd, "utf8"),
  ]);
  const provider = buildProvider(opts);

  const result = await evaluate({
    cv: cvText,
    jd: jdText,
    provider,
    language: opts.language,
    ...(opts.model ? { model: opts.model } : {}),
  });

  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  die(message);
});
