import type { APIRoute } from 'astro';
import { generateText } from 'ai';
import { getModel, isMock, MOCK_PROMPT } from '../../lib/ai-provider';
import { getKv, promptKey, tomorrow } from '../../lib/kv';

const DEFAULT_SYSTEM_PROMPT =
  'You are a creative writing coach. Generate a single, thought-provoking creative writing prompt in one or two sentences. Return only the prompt text, nothing else.';

export const GET: APIRoute = async ({ request }) => {
  // Verify the Vercel cron secret (Vercel sets Authorization: Bearer <CRON_SECRET>)
  const secret = import.meta.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // --- Generate the prompt ---
  let promptText: string;

  if (isMock()) {
    // Dev fallback: no API key needed
    promptText = MOCK_PROMPT;
  } else {
    const model = getModel();
    const system =
      (import.meta.env.AI_SYSTEM_PROMPT as string | undefined)?.trim() ||
      DEFAULT_SYSTEM_PROMPT;

    const { text } = await generateText({
      model,
      system,
      prompt: "Generate tomorrow's writing prompt.",
    });
    promptText = text.trim();
  }

  // --- Persist to KV (48-hour TTL so old keys clean themselves up) ---
  const kv = getKv();
  if (kv) {
    const key = promptKey(tomorrow());
    await kv.set(key, promptText, { ex: 60 * 60 * 48 });
  }

  return Response.json({ success: true, prompt: promptText, mock: isMock() });
};
