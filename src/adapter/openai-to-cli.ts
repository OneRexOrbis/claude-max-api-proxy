/**
 * Converts OpenAI chat request format to Claude CLI input
 */

import type { OpenAIChatRequest, OpenAIContentBlock } from "../types/openai.js";
import { CLAUDE_MODEL_IDS, type ClaudeModelId } from "../models.js";

export type ClaudeModel = ClaudeModelId;

export interface CliInput {
  prompt: string;
  model: ClaudeModel;
  sessionId?: string;
}

const MODEL_MAP: Record<string, ClaudeModel> = {
  // Compatibility aliases resolve to an explicit active model. This prevents
  // Claude CLI aliases from changing Luna's runtime without an HQ selection.
  "claude-opus-4-5": "claude-opus-4-5-20251101",
  "claude-sonnet-4-5": "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5": "claude-haiku-4-5-20251001",
  opus: "claude-opus-5",
  sonnet: "claude-sonnet-5",
  haiku: "claude-haiku-4-5-20251001",
  "opus-max": "claude-opus-5",
  "sonnet-max": "claude-sonnet-5",
};

/**
 * Extract Claude model alias from request model string
 */
export function extractModel(model: string): ClaudeModel {
  const stripped = model.replace(/^(?:claude-code-cli|claude-max)\//, "");
  if (CLAUDE_MODEL_IDS.has(stripped as ClaudeModelId)) {
    return stripped as ClaudeModelId;
  }
  if (MODEL_MAP[stripped]) {
    return MODEL_MAP[stripped];
  }

  throw new Error(`Unsupported Claude model: ${model}`);
}

/**
 * Extract text from a content field that may be a string or array of content blocks.
 * OpenAI API allows content as either:
 *   - A plain string: "Hello"
 *   - An array of content blocks: [{"type": "text", "text": "Hello"}]
 */
function extractText(content: string | OpenAIContentBlock[]): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === "text" || block.type === "input_text")
      .map((block) => block.text)
      .join("\n");
  }
  return String(content || "");
}

/**
 * Strip OpenClaw-specific tooling sections from system prompts.
 * These reference tools (exec, process, web_search, etc.) that don't exist
 * in the Claude Code CLI environment, causing the model to get confused.
 * We remove: ## Tooling, ## Tool Call Style, ## OpenClaw CLI Quick Reference,
 * ## OpenClaw Self-Update
 */
function stripOpenClawTooling(text: string): string {
  const sectionsToStrip = [
    "## Tooling",
    "## Tool Call Style",
    "## OpenClaw CLI Quick Reference",
    "## OpenClaw Self-Update",
  ];
  let result = text;
  for (const section of sectionsToStrip) {
    // Match from section header to the next ## header (or end of string)
    const pattern = new RegExp(
      section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "\\n[\\s\\S]*?(?=\\n## |$)",
      "g"
    );
    result = result.replace(pattern, "");
  }
  // Clean up excessive blank lines left behind
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
}

/**
 * Convert OpenAI messages array to a single prompt string for Claude CLI
 *
 * Claude Code CLI in --print mode expects a single prompt, not a conversation.
 * We format the messages into a readable format that preserves context.
 */
export function messagesToPrompt(
  messages: OpenAIChatRequest["messages"]
): string {
  const parts: string[] = [];

  for (const msg of messages) {
    const text = extractText(msg.content);
    switch (msg.role) {
      case "system":
        // System messages become context instructions
        // Strip OpenClaw tooling sections that conflict with Claude Code's native tools
        parts.push(`<system>\n${stripOpenClawTooling(text)}\n</system>\n`);
        break;

      case "user":
        // User messages are the main prompt
        parts.push(text);
        break;

      case "assistant":
        // Previous assistant responses for context
        parts.push(`<previous_response>\n${text}\n</previous_response>\n`);
        break;
    }
  }

  return parts.join("\n").trim();
}

/**
 * Convert OpenAI chat request to CLI input format
 */
export function openaiToCli(request: OpenAIChatRequest): CliInput {
  return {
    prompt: messagesToPrompt(request.messages),
    model: extractModel(request.model),
    sessionId: request.user, // Use OpenAI's user field for session mapping
  };
}
