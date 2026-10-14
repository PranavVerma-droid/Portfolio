/*
  Internal links, prefixed with the site's base path. The server build lives at "/",
  the GitHub Pages snapshot under "/Portfolio" (see astro.config.mjs).
*/
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** url('/projects/') → '/projects/' on the server, '/Portfolio/projects/' on Pages. */
export const url = (path: string) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
