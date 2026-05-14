import OpenAI from "openai";
import type { Provider } from "@linden/core";
import type { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export interface OpenAIProviderOptions {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

const DEFAULT_MODEL = "gpt-4o";
const SCHEMA_NAME = "MatchResult";

export class OpenAIProvider implements Provider {
  public readonly name = "openai" as const;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(opts: OpenAIProviderOptions) {
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
    });
    this.model = opts.model ?? DEFAULT_MODEL;
  }

  async complete(opts: {
    system: string;
    user: string;
    schema: ZodSchema;
  }): Promise<unknown> {
    const jsonSchema = zodToJsonSchema(opts.schema, {
      name: SCHEMA_NAME,
      $refStrategy: "none",
    });
    const schemaBody =
      "definitions" in jsonSchema && jsonSchema.definitions?.[SCHEMA_NAME]
        ? jsonSchema.definitions[SCHEMA_NAME]
        : jsonSchema;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: SCHEMA_NAME,
          strict: true,
          schema: schemaBody as Record<string, unknown>,
        },
      },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("OpenAIProvider: empty response content");
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `OpenAIProvider: response was not valid JSON. First 200 chars: ${text.slice(0, 200)}`,
      );
    }
  }
}
