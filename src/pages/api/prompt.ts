export const prerender = false;
export const runtime = 'edge';

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { MOCK_PROMPT } from '../../lib/ai-provider';
import { promptKey, today } from '../../lib/kv';

export const GET: APIRoute = async () => {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

  // No Redis credentials → return the dev mock immediately
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
