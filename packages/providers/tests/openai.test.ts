import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const createMock = vi.fn();

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      public readonly _ctorArgs: unknown;
      public readonly chat = { completions: { create: createMock } };
      constructor(args: unknown) {
        this._ctorArgs = args;
      }
    },
  };
});

import { OpenAIProvider } from "../src/openai.js";

const schema = z.object({ ok: z.boolean() }).strict();

describe("OpenAIProvider", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
    });
  });

  it("defaults to gpt-4o", async () => {
    const p = new OpenAIProvider({ apiKey: "test-key" });
    await p.complete({ system: "s", user: "u", schema });
    expect(createMock.mock.calls[0]?.[0].model).toBe("gpt-4o");
  });

  it("accepts a model override", async () => {
    const p = new OpenAIProvider({ apiKey: "test-key", model: "gpt-4o-mini" });
    await p.complete({ system: "s", user: "u", schema });
    expect(createMock.mock.calls[0]?.[0].model).toBe("gpt-4o-mini");
  });

  it("sends response_format with strict json_schema derived from the Zod schema", async () => {
    const p = new OpenAIProvider({ apiKey: "test-key" });
    await p.complete({ system: "s", user: "u", schema });
    const arg = createMock.mock.calls[0]?.[0];
    expect(arg.response_format.type).toBe("json_schema");
    expect(arg.response_format.json_schema.name).toBe("MatchResult");
    expect(arg.response_format.json_schema.strict).toBe(true);
    expect(arg.response_format.json_schema.schema).toBeTypeOf("object");
    expect(arg.response_format.json_schema.schema.type).toBe("object");
    expect(arg.response_format.json_schema.schema.properties).toBeDefined();
  });

  it("passes system + user as separate messages", async () => {
    const p = new OpenAIProvider({ apiKey: "test-key" });
    await p.complete({ system: "SYS_MARKER", user: "USR_MARKER", schema });
    const messages = createMock.mock.calls[0]?.[0].messages;
    expect(messages).toEqual([
      { role: "system", content: "SYS_MARKER" },
      { role: "user", content: "USR_MARKER" },
    ]);
  });

  it("parses the response content as JSON", async () => {
    const p = new OpenAIProvider({ apiKey: "test-key" });
    const result = await p.complete({ system: "s", user: "u", schema });
    expect(result).toEqual({ ok: true });
  });

  it("throws on non-JSON content", async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
    });
    const p = new OpenAIProvider({ apiKey: "test-key" });
    await expect(p.complete({ system: "s", user: "u", schema })).rejects.toThrow(
      /not valid JSON/,
    );
  });
});
