import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import {
  buildClaudeChildEnvironment,
  discoverClaudeHostAuth,
} from "./manager.js";

const originalToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  else process.env.CLAUDE_CODE_OAUTH_TOKEN = originalToken;
});

function fakeClaudeProcess(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "claude-auth-proc-"));
  const processDir = path.join(root, "1234");
  mkdirSync(processDir);
  writeFileSync(
    path.join(processDir, "cmdline"),
    "/home/user/.config/Claude-Teams/claude-code/2.1.204/claude\0--print\0"
  );
  writeFileSync(
    path.join(processDir, "environ"),
    [
      "CLAUDE_CODE_OAUTH_TOKEN=test-token",
      "CLAUDE_CODE_SUBSCRIPTION_TYPE=team",
      "UNRELATED_SECRET=must-not-leak",
      "",
    ].join("\0")
  );
  return root;
}

describe("Claude Teams host authentication", () => {
  it("imports only allowlisted values from a same-user Claude process", () => {
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    const root = fakeClaudeProcess();
    try {
      const auth = discoverClaudeHostAuth(root);
      assert.equal(auth.CLAUDE_CODE_OAUTH_TOKEN, "test-token");
      assert.equal(auth.CLAUDE_CODE_SUBSCRIPTION_TYPE, "team");
      assert.equal(auth.UNRELATED_SECRET, undefined);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("adds host authentication without propagating CLAUDECODE", () => {
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    process.env.CLAUDECODE = "nested";
    const root = fakeClaudeProcess();
    try {
      const env = buildClaudeChildEnvironment(root);
      assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, "test-token");
      assert.equal(env.CLAUDECODE, undefined);
    } finally {
      delete process.env.CLAUDECODE;
      rmSync(root, { recursive: true, force: true });
    }
  });
});
