export interface ClaudeModelDefinition {
  id: ClaudeModelId;
  name: string;
  reasoning: boolean;
  restricted?: boolean;
}

export const PUBLIC_CLAUDE_MODELS = [
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", reasoning: true },
  { id: "claude-fable-5-1", name: "Claude Fable 5.1", reasoning: true },
  { id: "claude-fable-5", name: "Claude Fable 5", reasoning: true },
  { id: "claude-opus-5", name: "Claude Opus 5", reasoning: true },
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", reasoning: true },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", reasoning: true },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", reasoning: true },
  { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5", reasoning: true },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", reasoning: true },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", reasoning: true },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", reasoning: true },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", reasoning: false },
] as const;

export const RESTRICTED_CLAUDE_MODELS = [
  {
    id: "claude-mythos-5-1",
    name: "Claude Mythos 5.1",
    reasoning: true,
    restricted: true,
  },
  {
    id: "claude-mythos-5",
    name: "Claude Mythos 5",
    reasoning: true,
    restricted: true,
  },
] as const;

export type ClaudeModelId =
  | (typeof PUBLIC_CLAUDE_MODELS)[number]["id"]
  | (typeof RESTRICTED_CLAUDE_MODELS)[number]["id"];

export function availableClaudeModels(
  enableRestricted = process.env.CLAUDE_ENABLE_RESTRICTED_MODELS === "true"
): readonly ClaudeModelDefinition[] {
  return enableRestricted
    ? [...PUBLIC_CLAUDE_MODELS, ...RESTRICTED_CLAUDE_MODELS]
    : PUBLIC_CLAUDE_MODELS;
}

export const CLAUDE_MODEL_IDS = new Set<ClaudeModelId>([
  ...PUBLIC_CLAUDE_MODELS.map((model) => model.id),
  ...RESTRICTED_CLAUDE_MODELS.map((model) => model.id),
]);
