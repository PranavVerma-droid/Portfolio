# Portfolio

Source for [pranavv.co.in](https://pranavv.co.in), Pranav Verma's personal site.

Version 3 is an [Astro](https://astro.build) server that renders every page on request from
[PocketBase](https://pocketbase.io), styled with the "Pranav's Portfolio" design system:
one narrow column, a serif for reading, a mono for facts, and one accent colour.

| Path | What |
| --- | --- |
| [`main/`](main/) | The site (Astro 6, Node). See [`main/README.md`](main/README.md) for its layout. |
| [`docker/`](docker/) | `docker-compose.yml` and `.env.example` for running the published image. |
| [`ollama/`](ollama/) | `Modelfile` for `pranavv-now`, the model that writes the home page's Now note. |
| [`.github/workflows/`](.github/workflows/) | Build, test and deploy pipelines. |

## Content

Everything on the site comes from the PocketBase instance at `https://pb-1.pranavv.co.in`
(set with `PB_URL`):

| Page | Collections |
| --- | --- |
| `/` | `general` (about, résumé), `education`, `projects_v2` (pinned), `blogs_v2`, `devBlogs_v2`, `socials` |
| `/projects/` | `projects_v2`, with write-ups from `devBlogs_v2` or `blogs` |
| `/writing/` | `blogs_v2`, `devBlogs_v2` |
| `/misc/` | `internships`, `publications`, `education` (scores), `certificates`, `competitions`, `languages`, `skills`, `trips`, plus the last song from ListenBrainz |

Edits in PocketBase show up on the next page load; there is no rebuild step.

### Now

The home page's Now note is written by a model on each page view. `/api/now` gathers everything
current from the dated collections (no end date, or one in the future), plus whatever ended or
happened in the last 45 days and starts in the next 30, and streams the model's 2-3 sentences into
the page. The note is labelled as AI generated. If the model is busy or down, the last note is shown
again; if there has never been one, the section says it couldn't be written.

The model is `llama3.1:8b` with the system prompt and examples in [`ollama/Modelfile`](ollama/Modelfile).
On the Ollama host:

```bash
ollama pull llama3.1:8b
ollama create pranavv-now -f ollama/Modelfile
```

## Run locally

Needs Node 22.12 or newer.

```bash
cd main
npm install
npm run dev            # http://localhost:4321
```

`npm run check` type-checks, `npm run build && npm start` runs the production server.

## Deploy with Docker

The site ships as one image, `ghcr.io/pranavverma-droid/portfolio-main`, listening on port 8080.

### 1. Run the published image

```bash
git clone https://github.com/PranavVerma-droid/Portfolio.git
cd Portfolio/docker
cp .env.example .env          # set PORT (host port) and PB_URL if needed
docker compose pull
docker compose up -d
```

The site is then at `http://127.0.0.1:${PORT}` (5646 by default). Put a reverse proxy in front of it
for HTTPS.

| Variable | Default | |
| --- | --- | --- |
| `PORT` | `5646` | Host port the container is published on |
| `PB_URL` | `https://pb-1.pranavv.co.in` | PocketBase instance to read content from |
| `OLLAMA_URL` | `https://ollama.pranavv.co.in` | Ollama host that writes the Now note |
| `OLLAMA_MODEL` | `pranavv-now` | Model built from `ollama/Modelfile` |

The container runs as a non-root user, restarts automatically, and has a health check
(`docker compose ps` shows `healthy` once it's serving).

### 2. Update

```bash
cd Portfolio/docker
docker compose pull && docker compose up -d
```

Each build is also tagged with its commit, so you can roll back by pinning
`image: ghcr.io/pranavverma-droid/portfolio-main:<commit-sha>` in `docker-compose.yml`.

### 3. Build the image yourself

```bash
docker build -t portfolio-main main
docker run -d -p 8080:8080 -e PB_URL=https://pb-1.pranavv.co.in portfolio-main
```

The build type-checks the site, so a type error fails the image build.

## CI/CD

| Workflow | When | What |
| --- | --- | --- |
| `docker-build-test.yml` | Pull requests to `master` | Type-check and build, then build the image and smoke-test the container |
| `docker-build-portfolio.yml` | Push to `master` | Build and push `portfolio-main:latest` and `:<commit-sha>` to GHCR |
| `server-deploy.yml` | Push to `master` | Wait for the image build, then on the `db1` runner pull and restart the `web` service in `/data/services/db1/portfolio` and wait for it to respond |

Needs the `GHCR_PAT` secret (a token with `write:packages`) and the self-hosted `db1` and
`ubuntu-selfhosted` runners.

# License

    Copyright (C) 2024  Pranav Verma

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    For more information, please see [LICENSE](LICENSE).
