/*
  The Ollama host's status as JSON, for the "Now" section: the model's specs and whether it's in
  memory, or why the host is down (see lib/ollama.ts). Probes are shared for a few seconds.
*/
import type { APIRoute } from 'astro';
import { ollamaStatus } from '../../lib/ollama';

export const GET: APIRoute = async () =>
  Response.json(await ollamaStatus(), { headers: { 'cache-control': 'no-store' } });
