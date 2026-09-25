import type { ClaudeCliResult } from "../types/claude-cli.js";

/**
 * Map CLI usage to OpenAI usage. The CLI reports uncached input separately
 * from cache reads/writes, so prompt_tokens must include all three.
 */
export function toOpenAIUsage(usage: ClaudeCliResult["usage"] | undefined) {
  const promptTokens =
    (usage?.input_tokens || 0) +
    (usage?.cache_creation_input_tokens || 0) +
    (usage?.cache_read_input_tokens || 0);
  const completionTokens = usage?.output_tokens || 0;
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };
}
