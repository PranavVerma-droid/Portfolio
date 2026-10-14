import { defineMiddleware } from 'astro:middleware';
import { getPostById, postHref } from './lib/posts';

/*
  Old v2 links: /blog.html?id=<record id> and /devblog.html?id=<record id>
  (also without .html). Posts kept their record ids when copied to v2, so each one
  redirects permanently to its new /writing/<slug>/ page. Unknown ids go to /writing/.
*/
const OLD_POST = /^\/(dev)?blogs?(\.html)?\/?$/i;

export const onRequest = defineMiddleware(async (ctx, next) => {
  if (OLD_POST.test(ctx.url.pathname)) {
    const id = ctx.url.searchParams.get('id')?.trim();
    const post = id ? await getPostById(id) : undefined;
    return post ? ctx.redirect(postHref(post), 301) : ctx.redirect('/writing/', 302);
  }

  const res = await next();
  /* Pages change only when PocketBase does, so let browsers and proxies reuse them briefly. */
  if (res.status === 200 && !res.headers.has('cache-control')) {
    res.headers.set('cache-control', 'public, max-age=60, stale-while-revalidate=600');
  }
  return res;
});
