import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractModel } from "./adapter/openai-to-cli.js";

describe("Claude model routing", () => {
  it("advertises and preserves Opus 5.5 without changing existing aliases", async () => {
    const { availableClaudeModels } = await import("./models.js");
    assert.ok(availableClaudeModels(false).some((model) => model.id === "claude-opus-5-5"));
    assert.equal(extractModel("claude-opus-5-5"), "claude-opus-5-5");
    assert.equal(extractModel("claude-max/claude-opus-5-5"), "claude-opus-5-5");
    assert.equal(extractModel("claude-code-cli/claude-opus-5-5"), "claude-opus-5-5");
    assert.equal(extractModel("opus"), "claude-opus-5");
  });
  it("preserves current model identities", () => {
    assert.equal(extractModel("claude-fable-5-1"), "claude-fable-5-1");
    assert.equal(extractModel("claude-fable-5"), "claude-fable-5");
    assert.equal(extractModel("claude-opus-5"), "claude-opus-5");
    assert.equal(extractModel("claude-opus-4-7"), "claude-opus-4-7");
    assert.equal(extractModel("claude-sonnet-5"), "claude-sonnet-5");
    assert.equal(
      extractModel("claude-haiku-4-5-20251001"),
      "claude-haiku-4-5-20251001"
    );
  });

  it("accepts provider-prefixed generation 5 model IDs", () => {
    assert.equal(extractModel("claude-max/claude-opus-5"), "claude-opus-5");
    assert.equal(extractModel("claude-code-cli/claude-sonnet-5"), "claude-sonnet-5");
  });

  it("resolves compatibility aliases to explicit active model IDs", () => {
    assert.equal(extractModel("opus"), "claude-opus-5");
    assert.equal(extractModel("sonnet"), "claude-sonnet-5");
    assert.equal(extractModel("haiku"), "claude-haiku-4-5-20251001");
    assert.equal(
      extractModel("claude-sonnet-4-5"),
      "claude-sonnet-4-5-20250929"
    );
  });

  it("rejects unknown models instead of silently falling back", () => {
    assert.throws(
      () => extractModel("claude-opus-99"),
      /Unsupported Claude model/
    );
  });
});
