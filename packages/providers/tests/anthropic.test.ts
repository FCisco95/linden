import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      public readonly _ctorArgs: unknown;
      public readonly messages = { create: createMock };
      constructor(args: unknown) {
        this._ctorArgs = args;
        MockAnthropic.lastInstance = this;
      }
      static lastInstance: MockAnthropic | null = null;
    },
  };
});

import { AnthropicProvider } from "../src/anthropic.js";
import AnthropicMod from "@anthropic-ai/sdk";

const schema = z.object({ ok: z.boolean() }).strict();

describe("AnthropicProvider", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ ok: true }) }],
    });
  });

  it("sets the structured-outputs beta header", () => {
    new AnthropicProvider({ apiKey: "test-key" });
    const lastInstance = (
      AnthropicMod as unknown as { lastInstance: { _ctorArgs: { defaultHeaders: Record<string, string> } } }
    ).lastInstance;
    expect(lastInstance._ctorArgs.defaultHeaders["anthropic-beta"]).toBe(
      "structured-outputs-2025-11-13",
    );
  });

  it("defaults to claude-sonnet-4-6", async () => {
    const p = new AnthropicProvider({ apiKey: "test-key" });
    await p.complete({ system: "sys", user: "usr", schema });
    expect(createMock).toHaveBeenCalledOnce();
    expect(createMock.mock.calls[0]?.[0].model).toBe("claude-sonnet-4-6");
  });

  it("accepts a model override", async () => {
    const p = new AnthropicProvider({ apiKey: "test-key", model: "claude-opus-4-7" });
    await p.complete({ system: "sys", user: "usr", schema });
    expect(createMock.mock.calls[0]?.[0].model).toBe("claude-opus-4-7");
  });

  it("attaches cache_control:ephemeral to the system block", async () => {
    const p = new AnthropicProvider({ apiKey: "test-key" });
    await p.complete({ system: "SYS_MARKER", user: "u", schema });
    const arg = createMock.mock.calls[0]?.[0];
    expect(arg.system).toEqual([
      {
        type: "text",
        text: "SYS_MARKER",
        cache_control: { type: "ephemeral" },
      },
    ]);
  });

  it("parses the text block as JSON", async () => {
    const p = new AnthropicProvider({ apiKey: "test-key" });
    const result = await p.complete({ system: "s", user: "u", schema });
    expect(result).toEqual({ ok: true });
  });

  it("throws on non-JSON text", async () => {
    createMock.mockResolvedValue({
      content: [{ type: "text", text: "not json" }],
    });
    const p = new AnthropicProvider({ apiKey: "test-key" });
    await expect(p.complete({ system: "s", user: "u", schema })).rejects.toThrow(
      /not valid JSON/,
    );
  });
});
