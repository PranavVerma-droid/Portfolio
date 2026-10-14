/*
  Basic PocketBase client. Sections add their own typed queries on top of list() and first().
*/

import { PB_URL as PB_URL_RAW } from 'astro:env/server';

const PB_URL = PB_URL_RAW.replace(/\/$/, '');

export interface BaseRecord { id: string; collectionId: string; created: string; updated: string }

interface ListResponse<T> { items: T[] }

/** Records from a collection. A missing collection returns []. */
export async function list<T extends BaseRecord>(collection: string, params: Record<string, string> = {}): Promise<T[]> {
  const q = new URLSearchParams({ perPage: '200', skipTotal: '1', ...params });
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${q}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`PocketBase ${res.status} for ${collection}`);
  return ((await res.json()) as ListResponse<T>).items;
}

/** The first record matching params, or undefined. */
export async function first<T extends BaseRecord>(collection: string, params: Record<string, string> = {}): Promise<T | undefined> {
  const [item] = await list<T>(collection, { ...params, perPage: '1' });
  return item;
}
