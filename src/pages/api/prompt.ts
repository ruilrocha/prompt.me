export const prerender = false;
export const runtime = 'edge';

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { MOCK_PROMPT } from '../../lib/ai-provider';
import { promptKey, today } from '../../lib/kv';

export const GET: APIRoute = async () => {
  // Explicit mock flag — set MOCK=true in .env.local to skip Redis entirely
  if (import.meta.env.MOCK === 'true') {
    return Response.json({ prompt: MOCK_PROMPT, mock: true });
  }

  // Support both the Vercel Upstash integration (KV_REST_API_*) and manual setup (UPSTASH_REDIS_REST_*)
  const url = import.meta.env.KV_REST_API_URL ?? import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.KV_REST_API_TOKEN ?? import.meta.env.UPSTASH_REDIS_REST_TOKEN;

  // No credentials in local dev → silently use mock
  if (!url || !token) {
    return Response.json({ prompt: MOCK_PROMPT, mock: true });
  }

  const kv = new Redis({ url, token });
  const key = promptKey(today());
  const prompt = await kv.get<string>(key);

  if (prompt) {
    return Response.json({ prompt, mock: false });
  }

  // Key missing (first deploy, or KV cleared) — fall back to mock
  return Response.json({ prompt: MOCK_PROMPT, mock: true });
};
