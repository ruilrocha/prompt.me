import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * A static prompt used in development when no API key is configured,
 * and as a last-resort fallback on the prompt page.
 */
export const MOCK_PROMPT =
  'Write a short story about a lighthouse keeper who discovers an ancient map inside a bottle washed ashore.';

/**
 * Returns true when we should skip the real LLM and use the mock instead.
 * Activates in development when no API key is present.
 */
export function isMock(): boolean {
  const isDev = import.meta.env.MODE !== 'production';
  const hasKey = Boolean(import.meta.env.OPENAI_API_KEY);
  return isDev && !hasKey;
}

/**
 * Builds and returns a Vercel AI SDK LanguageModel based on the AI_MODEL env var.
 *
 * Format: "<provider>:<model-id>"  e.g. "openai:gpt-4o-mini"
 *
 * To add a new provider:
 *   1. npm install @ai-sdk/<provider>
 *   2. import { create<Provider> } from '@ai-sdk/<provider>'
 *   3. Add a case below
 */
export function getModel(): LanguageModel {
  const modelStr = import.meta.env.AI_MODEL ?? 'openai:gpt-4o-mini';
  const colonIdx = modelStr.indexOf(':');
  const provider = colonIdx !== -1 ? modelStr.slice(0, colonIdx) : modelStr;
  const modelId = colonIdx !== -1 ? modelStr.slice(colonIdx + 1) : 'gpt-4o-mini';

  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: import.meta.env.OPENAI_API_KEY });
      return openai(modelId);
    }
    // Add more providers here, e.g.:
    // case 'anthropic': {
    //   const anthropic = createAnthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });
    //   return anthropic(modelId);
    // }
    default:
      throw new Error(
        `Unsupported AI provider: "${provider}". Add it to src/lib/ai-provider.ts.`,
      );
  }
}
