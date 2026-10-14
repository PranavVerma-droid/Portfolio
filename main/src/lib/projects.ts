/*
  The `projects_v2` collection, with each project's write-up.

  A write-up comes from the linked dev blog (devBlogs_v2) or, failing that, the linked
  blog. If both are linked the dev blog wins. Drafts count as not linked.
*/
import { list, type BaseRecord } from './pb';
import { richText } from './richtext';
import { isoDate, year } from './format';
import { toLinks } from './links';
import { toDevLog, type BlogRecord, type DevBlogRecord, type DevLog } from './posts';

/* ---------- PocketBase records ---------- */

interface ProjectRecord extends BaseRecord {
  name: string;
  descriptions: string;
  url1: string; url2: string; url3: string; url4: string;
  startDate: string;
  endDate: string;
  slugs: string;
  role: string;
  pinned: boolean;
  linkedDevBlog: string;
  linkedBlog: string;
  expand?: { linkedDevBlog?: DevBlogRecord; linkedBlog?: BlogRecord };
}

/* ---------- what pages use ---------- */

export type Writeup =
  | { kind: 'devlog'; title: string; log: DevLog }
  | { kind: 'blog'; title: string; date: string; html: string };

export interface Project {
  id: string;
  /** URL segment: the name made URL-safe, e.g. "tidal". */
  slug: string;
  name: string;
  /** Sanitized HTML. */
  description: string;
  role: string;
  tags: string[];
  links: { href: string; label: string }[];
  /** YYYY-MM-DD, or "" when unset. */
  start: string;
  end: string;
  /** No end date means the project is still going. */
  inProgress: boolean;
  /** Shown on the home page and listed first. */
  pinned: boolean;
  /** Year for the index column: the start year, else the end year. */
  year: string;
  writeup?: Writeup;
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function toWriteup(r: ProjectRecord): Writeup | undefined {
  const dev = r.expand?.linkedDevBlog;
  if (dev && !dev.isDraft) return { kind: 'devlog', title: dev.title, log: toDevLog(dev) };
  const blog = r.expand?.linkedBlog;
  if (blog && !blog.isDraft) {
    return { kind: 'blog', title: blog.title, date: blog.pubDateV2 ? isoDate(blog.pubDateV2) : '', html: richText(blog.contentV2) };
  }
  return undefined;
}

function toProject(r: ProjectRecord): Omit<Project, 'slug'> {
  const start = r.startDate ? isoDate(r.startDate) : '';
  const end = r.endDate ? isoDate(r.endDate) : '';
  return {
    id: r.id,
    name: r.name,
    description: richText(r.descriptions),
    role: r.role ?? '',
    tags: (r.slugs ?? '').split('_').map((t) => t.trim()).filter(Boolean),
    links: toLinks([r.url1, r.url2, r.url3, r.url4]),
    start,
    end,
    inProgress: !end,
    pinned: !!r.pinned,
    year: year(start || end),
    writeup: toWriteup(r),
  };
}

/* Pinned first, then in progress, then by end date, then start date, newest first. */
function compare(a: Omit<Project, 'slug'>, b: Omit<Project, 'slug'>): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  if (a.inProgress !== b.inProgress) return a.inProgress ? -1 : 1;
  return b.end.localeCompare(a.end) || b.start.localeCompare(a.start) || a.name.localeCompare(b.name);
}

export async function getProjects(): Promise<Project[]> {
  const records = await list<ProjectRecord>('projects_v2', { expand: 'linkedDevBlog,linkedBlog' });
  const taken = new Set<string>();
  // Same-named projects get -2, -3… in a fixed order (oldest first if the collection has `created`,
  // else by id) so a project's URL doesn't change between requests.
  const bySlug = new Map<string, string>();
  for (const r of [...records].sort((a, b) => (a.created ?? '').localeCompare(b.created ?? '') || a.id.localeCompare(b.id))) {
    let slug = slugify(r.name), n = 2;
    while (taken.has(slug)) slug = `${slugify(r.name)}-${n++}`;
    taken.add(slug);
    bySlug.set(r.id, slug);
  }
  return records.map((r) => ({ ...toProject(r), slug: bySlug.get(r.id)! })).sort(compare);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

/** The project's page, if it has a write-up to show. */
export const projectHref = (p: Project) => (p.writeup ? `/projects/${p.slug}/` : undefined);
