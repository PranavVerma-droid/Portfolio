# pranavv — v3 site

Astro 6, rendered on request. Design: the "Pranav's Portfolio" design system.
Content is being added section by section; for now every page is empty.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build && npm start
```

| env | default | |
| --- | --- | --- |
| `PB_URL` | `https://pb-1.pranavv.co.in` | PocketBase to read from |
| `HOST`, `PORT` | `localhost`, `4321` | server bind address |

## Layout

- `src/lib/pb.ts`: basic PocketBase client (`list`, `first`)
- `src/lib/format.ts`: date and text helpers
- `src/layouts/Base.astro`: head, header, footer
- `src/components/`: SiteHeader, Section, TextLink, SpecList, Empty
- `src/styles/site.css`: tokens and styles
