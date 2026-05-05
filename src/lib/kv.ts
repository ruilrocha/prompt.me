import { Redis } from '@upstash/redis';

/** Shared Redis client — returns null when credentials are not configured (local dev). */
export function getKv(): Redis | null {
  // Vercel Upstash integration uses KV_REST_API_* names; fall back to UPSTASH_* for manual setups.
  const url = import.meta.env.KV_REST_API_URL ?? import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.KV_REST_API_TOKEN ?? import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Key for a given date, e.g. "prompt:2026-04-30" */
export function promptKey(date: Date): string {
  return `prompt:${date.toISOString().slice(0, 10)}`;
}

export function today(): Date {
  return new Date();
}

export function tomorrow(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}
