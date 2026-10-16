/*
  The home page's "Now" note as plain text, streamed while the model writes it (see lib/now.ts).
  Never cached: each page view asks for a new one. x-now-source says whether this one is new
  ("model") or the last note repeated because the model was busy or down ("last").
*/
import type { APIRoute } from 'astro';
import { streamNow } from '../../lib/now';

export const GET: APIRoute = async () => {
  const note = await streamNow();
  if (!note) return new Response(null, { status: 503, headers: { 'cache-control': 'no-store' } });
  return new Response(note.body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      // Ask nginx not to buffer, so text reaches the page as it's generated.
      'x-accel-buffering': 'no',
      'x-now-source': note.source,
    },
  });
};
