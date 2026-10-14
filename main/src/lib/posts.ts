/*
  Writing: `blogs_v2` and `devBlogs_v2`, merged into one list of posts.

  Drafts are never fetched. Posts in the "Project(s)" category are left out of the
  Writing list (they're shown on their project's page) but keep their own URL.
  The record types and dev-log builder here are shared with projects.ts.
*/
import { list, type BaseRecord } from './pb';
import { richText } from './richtext';
import { isoDate, readingMinutes } from './format';

/* ---------- PocketBase records ---------- */

export interface DevBlogRecord extends BaseRecord {
  title: string;
  category: string;
  pubDate: string;
  isDraft: boolean;
  introlog: string;
  finalDate: string;
  finallog: string;
  [log: `log${number}` | `log${number}date`]: string;
}

export interface BlogRecord extends BaseRecord {
  title: string;
  category: string;
  pubDateV2: string;
  isDraft: boolean;
  contentV2: string;
}

/* ---------- dev logs ---------- */

export interface LogEntry { date: string; html: string }
export interface DevLog { intro: string; entries: LogEntry[]; final?: LogEntry }

const LOG_COUNT = 10;
const day = (pb: string | undefined) => (pb ? isoDate(pb) : '');

/** introlog, log1–log10 (empty ones skipped) and finallog, sanitized. */
export function toDevLog(r: DevBlogRecord): DevLog {
  const entries: LogEntry[] = [];
  for (let i = 1; i <= LOG_COUNT; i++) {
    const html = richText(r[`log${i}`]);
    if (html) entries.push({ date: day(r[`log${i}date`]), html });
  }
  const final = richText(r.finallog);
  return { intro: richText(r.introlog), entries, final: final ? { date: day(r.finalDate), html: final } : undefined };
}

/* ---------- posts ---------- */

interface PostMeta {
  id: string;
  title: string;
  category: string;
  /** YYYY-MM-DD */
  date: string;
  minutes: number;
}
type PostBody = { kind: 'blog'; html: string } | { kind: 'devlog'; log: DevLog };
type Unslugged = PostMeta & PostBody;

export type Post = Unslugged & {
  /** URL segment: the title made URL-safe, e.g. "the-switch-to-linux". */
  slug: string;
};

/** Project write-ups live on their project page, not in the Writing list. */
export const isProjectPost = (p: Pick<Post, 'category'>) => /^projects?$/i.test(p.category.trim());

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
}

function fromBlog(r: BlogRecord): Unslugged {
  const html = richText(r.contentV2);
  return { kind: 'blog', id: r.id, title: r.title, category: r.category ?? '', date: day(r.pubDateV2), minutes: readingMinutes(html), html };
}

function fromDevBlog(r: DevBlogRecord): Unslugged {
  const log = toDevLog(r);
  const text = [log.intro, ...log.entries.map((e) => e.html), log.final?.html ?? ''].join(' ');
  return { kind: 'devlog', id: r.id, title: r.title, category: r.category ?? '', date: day(r.pubDate), minutes: readingMinutes(text), log };
}

/** Every published post, newest first, including project posts. */
export async function getAllPosts(): Promise<Post[]> {
  const [blogs, devBlogs] = await Promise.all([
    list<BlogRecord>('blogs_v2', { filter: 'isDraft = false' }),
    list<DevBlogRecord>('devBlogs_v2', { filter: 'isDraft = false' }),
  ]);
  const posts = [...blogs.map(fromBlog), ...devBlogs.map(fromDevBlog)];

  // Same-titled posts get -2, -3… in a fixed order (by id) so URLs don't change between requests.
  const taken = new Set<string>();
  const slugs = new Map<string, string>();
  for (const p of [...posts].sort((a, b) => a.id.localeCompare(b.id))) {
    const base = slugify(p.title);
    let slug = base, n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    taken.add(slug);
    slugs.set(p.id, slug);
  }

  return posts
    .map((p): Post => ({ ...p, slug: slugs.get(p.id)! }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Posts for the Writing list: everything except project posts. */
export async function getPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => !isProjectPost(p));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

export const postHref = (p: Post) => `/writing/${p.slug}/`;
