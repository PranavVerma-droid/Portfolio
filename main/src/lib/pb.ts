/*
  Basic PocketBase client. Sections add their own typed queries on top of list(), first() and getOne().
*/

import { PB_URL as PB_URL_RAW } from 'astro:env/server';

const PB_URL = PB_URL_RAW.replace(/\/$/, '');

/* created/updated exist only if the collection has those autodate fields. */
export interface BaseRecord { id: string; collectionId: string; created?: string; updated?: string }

interface ListResponse<T> { items: T[] }

/*
  PocketBase answers in about a second, so responses are kept in memory on the same terms as the
  pages' cache-control (middleware.ts): fresh for a minute, then served stale for up to ten while
  one background request refreshes them. Failed requests are never cached. Callers get a copy.
*/
const FRESH_MS = 60_000;
const STALE_MS = 600_000;
const cache = new Map<string, { at: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

function refresh<T>(key: string, load: () => Promise<T>): Promise<T> {
  let p = inflight.get(key) as Promise<T> | undefined;
  if (!p) {
    p = load()
      .then((value) => { cache.set(key, { at: Date.now(), value }); return value; })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  const age = hit ? Date.now() - hit.at : Infinity;
  if (age >= STALE_MS) return structuredClone(await refresh(key, load));
  if (age >= FRESH_MS) refresh(key, load).catch((err) => console.error(err));
  return structuredClone(hit!.value as T);
}

/** Records from a collection. A missing collection returns []. */
export function list<T extends BaseRecord>(collection: string, params: Record<string, string> = {}): Promise<T[]> {
  const q = new URLSearchParams({ perPage: '200', skipTotal: '1', ...params });
  return cached(`list:${collection}?${q}`, async () => {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${q}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`PocketBase ${res.status} for ${collection}`);
    return ((await res.json()) as ListResponse<T>).items;
  });
}

/** The first record matching params, or undefined. */
export async function first<T extends BaseRecord>(collection: string, params: Record<string, string> = {}): Promise<T | undefined> {
  const [item] = await list<T>(collection, { ...params, perPage: '1' });
  return item;
}

/** One record by id, or undefined if it doesn't exist. */
export function getOne<T extends BaseRecord>(collection: string, id: string): Promise<T | undefined> {
  return cached(`one:${collection}/${id}`, async () => {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${encodeURIComponent(id)}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`PocketBase ${res.status} for ${collection}/${id}`);
    return (await res.json()) as T;
  });
}

/** Public URL of a file field. download: true makes the browser save it instead of opening it. */
export function fileUrl(record: BaseRecord, filename: string, { download = false } = {}): string {
  const url = `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`;
  return download ? `${url}?download=1` : url;
}
