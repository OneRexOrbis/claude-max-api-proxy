import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toOpenAIUsage } from "./adapter/usage.js";
import { contextWindowFor } from "./models.js";

describe("usage mapping", () => {
  it("counts cache reads and writes as prompt tokens", () => {
    const usage = toOpenAIUsage({
      input_tokens: 2,
      output_tokens: 10,
      cache_creation_input_tokens: 1_000,
      cache_read_input_tokens: 777_000,
    });
    assert.deepEqual(usage, {
      prompt_tokens: 778_002,
      completion_tokens: 10,
      total_tokens: 778_012,
    });
  });

  it("handles missing usage", () => {
    assert.deepEqual(toOpenAIUsage(undefined), {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });
  });
});

describe("context windows", () => {
  it("gives generation 5 models 1M and older models 200K", () => {
    assert.equal(contextWindowFor("claude-opus-5-5"), 1_000_000);
    assert.equal(contextWindowFor("claude-opus-5"), 1_000_000);
    assert.equal(contextWindowFor("claude-fable-5-1"), 1_000_000);
    assert.equal(contextWindowFor("claude-sonnet-5"), 1_000_000);
    assert.equal(contextWindowFor("claude-opus-4-8"), 200_000);
    assert.equal(contextWindowFor("claude-haiku-4-5-20251001"), 200_000);
  });
});
