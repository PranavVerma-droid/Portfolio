/*
  The Ollama host behind the "Now" note: its URL, what went wrong when it fails, and a status
  probe served to anyone by /api/ollama (the model's specs, whether it's in memory, and, when
  it's down, why and since when).

  Errors are reported by cause (connection refused, DNS, a proxy's 502…), never by raw message,
  so the host's address doesn't leak to the page. Up/down times are as seen by this server since
  it started.
*/
import { OLLAMA_URL as OLLAMA_URL_RAW, OLLAMA_MODEL } from 'astro:env/server';

export const OLLAMA_URL = OLLAMA_URL_RAW.replace(/\/$/, '');
export { OLLAMA_MODEL };

/* A probe that takes longer than this counts as down. */
const PROBE_MS = 5_000;
/* Visitors share one probe for this long, so the page can't be used to hammer the host. */
const CACHE_MS = 10_000;

export interface Failure { code: string; message: string }

/** A non-2xx answer from the host or a proxy in front of it. */
export class HttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

const NET: Record<string, string> = {
  ECONNREFUSED: 'connection refused',
  ENOTFOUND: 'DNS lookup failed',
  EAI_AGAIN: 'DNS lookup failed',
  ECONNRESET: 'connection reset',
  EPIPE: 'connection dropped',
  EHOSTUNREACH: 'host unreachable',
  ENETUNREACH: 'network unreachable',
  ETIMEDOUT: 'connection timed out',
  UND_ERR_CONNECT_TIMEOUT: 'connection timed out',
  UND_ERR_HEADERS_TIMEOUT: 'connected, but no response',
  UND_ERR_SOCKET: 'connection dropped',
  CERT_HAS_EXPIRED: 'TLS certificate expired',
  DEPTH_ZERO_SELF_SIGNED_CERT: 'self-signed TLS certificate',
  SELF_SIGNED_CERT_IN_CHAIN: 'self-signed TLS certificate',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'untrusted TLS certificate',
  ERR_TLS_CERT_ALTNAME_INVALID: 'TLS certificate does not match the host',
};

const HTTP: Record<number, string> = {
  502: 'bad gateway: the proxy is up, Ollama behind it is not',
  503: 'service unavailable',
  504: 'gateway timeout: Ollama took too long to answer the proxy',
  521: 'origin down: the proxy could not connect to Ollama',
  522: 'origin connection timed out',
  523: 'origin unreachable',
  524: 'origin timed out',
};

/* Ollama's own error text is useful ("model requires more memory…"); addresses in it are not. */
const scrub = (s: string) => s.replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, '<host>').replace(/https?:\/\/\S+/g, '<url>').slice(0, 200);

/** What went wrong, in words safe to show anyone. `ms` is the timeout that was hit, if any. */
export function describe(err: unknown, ms = PROBE_MS): Failure {
  if (err instanceof HttpError) return { code: `HTTP ${err.status}`, message: HTTP[err.status] ?? scrub(err.message) };
  const e = err as Error & { code?: string; cause?: { code?: string; errors?: { code?: string }[] } };
  if (e?.name === 'TimeoutError') return { code: 'TIMEOUT', message: `no answer within ${Math.round(ms / 1000)}s` };
  const code = e?.cause?.code ?? e?.cause?.errors?.[0]?.code ?? e?.code;
  if (code && NET[code]) return { code, message: NET[code] };
  return { code: code ?? 'ERROR', message: scrub(e?.message || 'unknown error') };
}

/** A timeout error for an AbortController, read by describe() as TIMEOUT. */
export const timeoutError = () => Object.assign(new Error('timed out'), { name: 'TimeoutError' });

/** Throws an HttpError for a non-2xx answer, with Ollama's {"error"} text when there is one. */
export async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  let message = res.statusText || 'error';
  try { message = ((await res.json()) as { error?: string }).error ?? message; } catch { /* not JSON */ }
  throw new HttpError(res.status, message);
}

/* ---------- up / down, as seen by this server ---------- */

const health: { up?: boolean; since?: string; lastUp?: string } = {};

/** Notes whether the host answered; called by the probe and by every note generation. */
export function record(up: boolean) {
  const now = new Date().toISOString();
  if (health.up !== up) { health.up = up; health.since = now; }
  if (up) health.lastUp = now;
}

/* ---------- status ---------- */

export interface OllamaStatus {
  /** 'up': notes can be written. 'no-model': the host answers but the model isn't on it. */
  state: 'up' | 'down' | 'no-model';
  checkedAt: string;
  /** When it entered this state, and when it last answered (both since this server started). */
  since?: string;
  lastUp?: string;
  latencyMs?: number;
  failure?: Failure;
  version?: string;
  model?: {
    name: string;
    base?: string;           // e.g. "Llama 3.2 3B Instruct"
    family?: string;
    parameters?: string;     // e.g. "3.2B"
    quantization?: string;   // e.g. "Q4_K_M"
    format?: string;
    context?: number;        // num_ctx it runs with
    maxContext?: number;     // what the base model supports
    temperature?: number;
    maxTokens?: number;      // num_predict
  };
  /** In memory right now, or null if a request would have to load it first. */
  loaded?: { bytes: number; gpuPct: number; until?: string } | null;
}

interface Show {
  details?: { family?: string; format?: string; parameter_size?: string; quantization_level?: string };
  model_info?: Record<string, unknown>;
  parameters?: string;
}
interface Ps { models?: { name: string; model: string; size: number; size_vram: number; expires_at?: string }[] }

const tagged = (name: string) => (name.includes(':') ? name : `${name}:latest`);
const param = (params: string | undefined, key: string) => {
  const m = params?.match(new RegExp(`^${key}\\s+(\\S+)`, 'm'));
  return m ? Number(m[1]) : undefined;
};

const get = (path: string, init?: RequestInit) =>
  fetch(`${OLLAMA_URL}${path}`, { ...init, signal: AbortSignal.timeout(PROBE_MS) }).then(ensureOk).then((r) => r.json());

async function probe(): Promise<OllamaStatus> {
  const t0 = performance.now();
  const checkedAt = new Date().toISOString();
  const done = (s: Omit<OllamaStatus, 'checkedAt' | 'since' | 'lastUp'>): OllamaStatus => {
    record(s.state !== 'down');
    return { ...s, checkedAt, since: health.since, lastUp: health.lastUp };
  };

  let version: string;
  try {
    version = ((await get('/api/version')) as { version: string }).version;
  } catch (err) {
    return done({ state: 'down', failure: describe(err) });
  }
  const latencyMs = Math.round(performance.now() - t0);

  const [show, ps] = await Promise.allSettled([
    get('/api/show', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: OLLAMA_MODEL }) }) as Promise<Show>,
    get('/api/ps') as Promise<Ps>,
  ]);
  if (show.status === 'rejected') {
    const failure = describe(show.reason);
    const missing = show.reason instanceof HttpError && show.reason.status === 404;
    return done({ state: missing ? 'no-model' : 'down', latencyMs, version, failure: missing ? { code: 'NO MODEL', message: `${OLLAMA_MODEL} isn't on the host` } : failure });
  }

  const { details = {}, model_info: info = {}, parameters } = show.value;
  const arch = info['general.architecture'] as string | undefined;
  const base = [info['general.basename'], info['general.size_label'], info['general.finetune']]
    .filter((s): s is string => typeof s === 'string' && !!s).join(' ').replace(/-/g, ' ') || undefined;
  const running = ps.status === 'fulfilled'
    ? ps.value.models?.find((m) => m.name === tagged(OLLAMA_MODEL) || m.model === tagged(OLLAMA_MODEL))
    : undefined;

  return done({
    state: 'up',
    latencyMs,
    version,
    model: {
      name: OLLAMA_MODEL,
      base,
      family: details.family,
      parameters: details.parameter_size,
      quantization: details.quantization_level,
      format: details.format,
      context: param(parameters, 'num_ctx'),
      maxContext: arch ? (info[`${arch}.context_length`] as number | undefined) : undefined,
      temperature: param(parameters, 'temperature'),
      maxTokens: param(parameters, 'num_predict'),
    },
    // /api/ps failing leaves this undefined (unknown), not null (known cold).
    loaded: ps.status === 'rejected' ? undefined : running
      ? { bytes: running.size, gpuPct: running.size ? Math.round((running.size_vram / running.size) * 100) : 0, until: running.expires_at }
      : null,
  });
}

let cached: { at: number; value: Promise<OllamaStatus> } | undefined;

/** The host's status, shared by every request in a CACHE_MS window. */
export function ollamaStatus(): Promise<OllamaStatus> {
  if (!cached || Date.now() - cached.at > CACHE_MS) cached = { at: Date.now(), value: probe() };
  return cached.value;
}
