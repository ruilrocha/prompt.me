/**
 * Seed today's (and optionally tomorrow's) prompt into Upstash Redis.
 *
 * Usage:
 *   npx tsx scripts/seed-prompt.ts
 *
 * Env vars required:
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 *   OPENAI_API_KEY (optional — falls back to MOCK_PROMPT when absent)
 *   AI_MODEL, AI_SYSTEM_PROMPT (optional)
 *
 * Load them from .env.local with:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/seed-prompt.ts
 */

import { Redis } from '@upstash/redis';
import { generateText } from 'ai';

// ---------------------------------------------------------------------------
// Inline helpers (no tsconfig path aliases in plain Node scripts)
// ---------------------------------------------------------------------------
const MOCK_PROMPT =
  'Write a short story about a lighthouse keeper who discovers an ancient map inside a bottle washed ashore.';

function isMock() {
  return !process.env.OPENAI_API_KEY;
}

async function generate(): Promise<string> {
  if (isMock()) {
    console.log('⚠  No OPENAI_API_KEY found — using mock prompt.');
    return MOCK_PROMPT;
  }

  const { createOpenAI } = await import('@ai-sdk/openai');
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelId = (process.env.AI_MODEL ?? 'openai:gpt-4o-mini').split(':')[1] ?? 'gpt-4o-mini';
  const model = openai(modelId);

  const system =
    process.env.AI_SYSTEM_PROMPT?.trim() ||
    'You are a creative writing coach. Generate a single, thought-provoking creative writing prompt in one or two sentences. Return only the prompt text, nothing else.';

  const { text } = await generateText({
    model,
    system,
    prompt: "Generate a writing prompt for today.",
  });
  return text.trim();
}

function promptKey(date: Date) {
  return `prompt:${date.toISOString().slice(0, 10)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('❌  UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set.');
  process.exit(1);
}

const kv = new Redis({ url, token });

const todayDate = new Date();
const tomorrowDate = new Date();
tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

console.log('Generating prompts…');
const [todayPrompt, tomorrowPrompt] = await Promise.all([generate(), generate()]);

await kv.set(promptKey(todayDate), todayPrompt, { ex: 60 * 60 * 48 });
await kv.set(promptKey(tomorrowDate), tomorrowPrompt, { ex: 60 * 60 * 48 });

console.log(`✅  Seeded ${promptKey(todayDate)}:\n   "${todayPrompt}"`);
console.log(`✅  Seeded ${promptKey(tomorrowDate)}:\n   "${tomorrowPrompt}"`);

