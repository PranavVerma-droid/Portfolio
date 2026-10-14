// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// Pages render on request so PocketBase content is always current (see src/lib/pb.ts).
export default defineConfig({
  site: 'https://pranavv.co.in',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  // Trip photos are resized on request by Astro's image endpoint (/_image), which only accepts these hosts.
  image: {
    domains: ['pb-1.pranavv.co.in'],
  },
  env: {
    schema: {
      // 'secret' so it is read at runtime, not inlined at build time.
      PB_URL: envField.string({ context: 'server', access: 'secret', url: true, default: 'https://pb-1.pranavv.co.in' }),
    },
  },
});
