import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractModel } from "./adapter/openai-to-cli.js";

describe("Claude generation 5 routing", () => {
  it("preserves each generation 5 model identity", () => {
    assert.equal(extractModel("claude-fable-5"), "claude-fable-5");
    assert.equal(extractModel("claude-opus-5"), "claude-opus-5");
    assert.equal(extractModel("claude-sonnet-5"), "claude-sonnet-5");
  });

  it("accepts provider-prefixed generation 5 model IDs", () => {
    assert.equal(extractModel("claude-max/claude-opus-5"), "claude-opus-5");
    assert.equal(extractModel("claude-code-cli/claude-sonnet-5"), "claude-sonnet-5");
  });

  it("rejects unknown models instead of silently falling back", () => {
    assert.throws(
      () => extractModel("claude-opus-99"),
      /Unsupported Claude model/
    );
  });
});
