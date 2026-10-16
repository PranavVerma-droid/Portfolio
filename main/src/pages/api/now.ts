/*
  The home page's "Now" note as Server-Sent Events, streamed while the model writes it
  (see lib/now.ts for the events). Never cached: each page view asks for a new one.
*/
import type { APIRoute } from 'astro';
import { streamNow } from '../../lib/now';

export const GET: APIRoute = () =>
  new Response(streamNow(), {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      // no-transform: proxies mustn't compress (and so buffer) it.
      'cache-control': 'no-store, no-transform',
      // Ask nginx not to buffer, so text reaches the page as it's generated.
      'x-accel-buffering': 'no',
    },
  });
