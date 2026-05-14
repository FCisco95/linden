import Anthropic from "@anthropic-ai/sdk";
import type { Provider } from "@linden/core";
import type { ZodSchema } from "zod";

export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  baseURL?: string;
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 4096;
const STRUCTURED_OUTPUTS_BETA = "structured-outputs-2025-11-13";

export class AnthropicProvider implements Provider {
  public readonly name = "anthropic" as const;
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(opts: AnthropicProviderOptions) {
    this.client = new Anthropic({
      apiKey: opts.apiKey,
      ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
      defaultHeaders: { "anthropic-beta": STRUCTURED_OUTPUTS_BETA },
    });
    this.model = opts.model ?? DEFAULT_MODEL;
    this.maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async complete(opts: {
    system: string;
    user: string;
    schema: ZodSchema;
  }): Promise<unknown> {
    // The structured-outputs beta accepts `cache_control` on system blocks,
    // but the SDK's published types haven't caught up — cast at the boundary.
    const params = {
      model: this.model,
      max_tokens: this.maxTokens,
      system: [
        {
          type: "text",
          text: opts.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: opts.user }],
    };
    const response = (await this.client.messages.create(
      params as never,
    )) as { content: Array<{ type: string; text?: string }> };

    const block = response.content.find((b) => b.type === "text");
    if (!block || typeof block.text !== "string") {
      throw new Error("AnthropicProvider: no text block in response");
    }
    const text = block.text;

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `AnthropicProvider: response was not valid JSON. First 200 chars: ${text.slice(0, 200)}`,
      );
    }
  }
}
