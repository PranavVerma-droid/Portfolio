import { defineMiddleware } from 'astro:middleware';

/* Pages change only when PocketBase does, so let browsers and proxies reuse them briefly. */
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if (res.status === 200 && !res.headers.has('cache-control')) {
    res.headers.set('cache-control', 'public, max-age=60, stale-while-revalidate=600');
  }
  return res;
});
