/**
 * Seed prompts into Upstash Redis.
 *
 * Behaviour:
 *   - Always generates tomorrow's prompt.
 *   - Generates today's prompt only if it doesn't already exist in KV.
 *
 * Usage:
 *   npx tsx scripts/seed-prompt.ts
 *
 * Env vars required:
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 *   GOOGLE_GENERATIVE_AI_API_KEY (optional — falls back to MOCK_PROMPT when absent)
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
  return !process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

async function generate(label: string): Promise<string> {
  if (isMock()) {
    console.log(`⚠  No GOOGLE_GENERATIVE_AI_API_KEY found — using mock prompt for ${label}.`);
    return MOCK_PROMPT;
  }

  const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const modelId = (process.env.AI_MODEL ?? 'google:gemini-2.0-flash').split(':')[1] ?? 'gemini-2.0-flash';
  const model = google(modelId);

  const system =
    process.env.AI_SYSTEM_PROMPT?.trim() ||
    'You are a creative writing coach. Generate a single, thought-provoking creative writing prompt in one or two sentences. Return only the prompt text, nothing else.';

  const { text } = await generateText({
    model,
    system,
    prompt: `Generate a writing prompt for ${label}.`,
  });
  return text.trim();
}

function promptKey(date: Date) {
  return `prompt:${date.toISOString().slice(0, 10)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('❌  KV_REST_API_URL and KV_REST_API_TOKEN must be set (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).');
  process.exit(1);
}

const kv = new Redis({ url, token });

const todayDate = new Date();
const tomorrowDate = new Date();
tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

const todayKey = promptKey(todayDate);
const tomorrowKey = promptKey(tomorrowDate);

// Check whether today's prompt already exists
const existingToday = await kv.get<string>(todayKey);

if (existingToday) {
  console.log(`ℹ  Today's prompt already exists — skipping.\n   "${existingToday}"`);
} else {
  console.log("Generating today's prompt…");
  const todayPrompt = await generate("today");
  await kv.set(todayKey, todayPrompt, { ex: 60 * 60 * 48 });
  console.log(`✅  Seeded ${todayKey}:\n   "${todayPrompt}"`);
}

// Always generate tomorrow's prompt
console.log("Generating tomorrow's prompt…");
const tomorrowPrompt = await generate("tomorrow");
await kv.set(tomorrowKey, tomorrowPrompt, { ex: 60 * 60 * 48 });
console.log(`✅  Seeded ${tomorrowKey}:\n   "${tomorrowPrompt}"`);
