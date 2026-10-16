// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// Pages render on request, so PocketBase edits show within a minute (see the cache in src/lib/pb.ts).
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
      // The Ollama host that writes the home page's Now note, and the model built from ollama/Modelfile.
      OLLAMA_URL: envField.string({ context: 'server', access: 'secret', url: true, default: 'https://ollama.pranavv.co.in' }),
      OLLAMA_MODEL: envField.string({ context: 'server', access: 'secret', default: 'pranavv-now' }),
    },
  },
});
