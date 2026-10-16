/*
  The home page's "Now" note, written by a model on the Ollama host (ollama/Modelfile).

  Every dated collection is read for what is current: anything started with no end date, or one
  still in the future. Things that ended or happened in the last RECENT_DAYS, and things starting in
  the next UPCOMING_DAYS, go in too, marked so the model can mention them briefly. The note is
  generated fresh for each page view and streamed as plain text by /api/now.
*/
import { OLLAMA_URL as OLLAMA_URL_RAW, OLLAMA_MODEL } from 'astro:env/server';
import { getProjects } from './projects';
import { getEducation } from './education';
import { getInternships } from './internships';
import { getSocialWork } from './socialwork';
import { getTrips } from './trips';
import { getCompetitions } from './competitions';
import { getPublications } from './publications';
import { getAllPosts } from './posts';
import { getGeneral } from './general';
import { attempt } from './attempt';
import { stripHtml } from './format';

const OLLAMA_URL = OLLAMA_URL_RAW.replace(/\/$/, '');

const RECENT_DAYS = 45;
const UPCOMING_DAYS = 30;
const DESCRIPTION_CHARS = 240;
const ABOUT_CHARS = 700;
/* A cold model load on the Ollama host can take a while; past this the note gives up. */
const TIMEOUT_MS = 60_000;
/* Generations running at once. Past this, a request gets the last note instead of a new one. */
const MAX_RUNNING = 2;
const MAX_SENTENCES = 3;

type When = 'current' | 'recent' | 'upcoming';
interface Fact { when: When; kind: string; text: string }

const today = () => new Date().toISOString().slice(0, 10);
const shiftDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);
const short = (html: string, max = DESCRIPTION_CHARS) => {
  const s = stripHtml(html).replace(/↗/g, '');
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, '')}…` : s;
};
const month = (iso: string) => iso.slice(0, 7);

/** Where a start–end span sits relative to today, or undefined if it's too far off to mention. */
function spanWhen(start: string, end: string, now: string): When | undefined {
  if (start && start > now) return start <= shiftDays(now, UPCOMING_DAYS) ? 'upcoming' : undefined;
  if (!end || end >= now) return start || end ? 'current' : undefined;
  return end >= shiftDays(now, -RECENT_DAYS) ? 'recent' : undefined;
}

/** A single date (a post, a competition): recent or upcoming, else undefined. */
function dayWhen(date: string, now: string): When | undefined {
  if (!date) return undefined;
  if (date > now) return date <= shiftDays(now, UPCOMING_DAYS) ? 'upcoming' : undefined;
  return date >= shiftDays(now, -RECENT_DAYS) ? 'recent' : undefined;
}

function span(start: string, end: string, when: When): string {
  if (when === 'current') return start ? `since ${month(start)}` : `until ${month(end)}`;
  return `${start || '?'} to ${end || '?'}`;
}

const line = (...parts: (string | undefined)[]) => parts.filter(Boolean).join('. ');

/** Everything current, recent or upcoming, from every dated collection. A failed collection is skipped. */
async function facts(now: string): Promise<{ about: string; facts: Fact[] }> {
  const [general, projects, education, internships, socialWork, trips, competitions, publications, posts] = await Promise.all([
    attempt(getGeneral), attempt(getProjects), attempt(getEducation), attempt(getInternships), attempt(getSocialWork),
    attempt(getTrips), attempt(getCompetitions), attempt(getPublications), attempt(getAllPosts),
  ]);
  const out: Fact[] = [];

  for (const p of projects ?? []) {
    const when = spanWhen(p.start, p.end, now);
    if (when) out.push({ when, kind: 'Project', text: line(`${p.name} (${span(p.start, p.end, when)})${p.role ? `, ${p.role}` : ''}`, short(p.description)) });
  }
  for (const e of education?.institutes ?? []) {
    const when = spanWhen(e.start, e.end, now);
    if (when) out.push({ when, kind: 'Studying', text: line(`${e.title} (${span(e.start, e.end, when)})`, short(e.description)) });
  }
  for (const i of internships ?? []) {
    const when = spanWhen(i.start, i.end, now);
    if (when) out.push({ when, kind: 'Internship', text: line(`${i.title}${i.institute ? `, ${i.institute}` : ''} (${span(i.start, i.end, when)})`, short(i.description)) });
  }
  for (const s of socialWork ?? []) {
    const when = spanWhen(s.start, s.end, now);
    if (when) out.push({ when, kind: 'Volunteering', text: line(`${s.title}${s.institute ? `, ${s.institute}` : ''} (${span(s.start, s.end, when)})`, short(s.description)) });
  }
  for (const t of trips ?? []) {
    const when = spanWhen(t.start, t.end || t.start, now);
    if (when) out.push({ when, kind: 'Trip', text: `${t.name}${t.country ? `, ${t.country}` : ''} (${t.start} to ${t.end || t.start})` });
  }
  for (const c of competitions ?? []) {
    const when = dayWhen(c.date, now);
    if (when) out.push({ when, kind: 'Competition', text: line(`${c.title} (${c.date})${c.won ? ', won' : ''}`, short(c.description)) });
  }
  for (const p of publications ?? []) {
    const when = dayWhen(p.date, now);
    if (when) out.push({ when, kind: 'Publication', text: `"${p.title}"${p.journal ? `, ${p.journal}` : ''} (${p.date})` });
  }
  for (const p of posts ?? []) {
    const when = dayWhen(p.date, now);
    if (when === 'recent') out.push({ when, kind: 'Post', text: `"${p.title}" (${p.date})` });
  }

  return { about: general ? short(general.about, ABOUT_CHARS) : '', facts: out };
}

/** The user message sent to the model, in the shape of the examples in ollama/Modelfile. */
export async function nowPrompt(): Promise<string | undefined> {
  const now = today();
  const { about, facts: all } = await facts(now);
  if (all.length === 0) return undefined;
  const block = (when: When) => {
    const items = all.filter((f) => f.when === when);
    return items.length ? `${when.toUpperCase()}\n${items.map((f) => `- ${f.kind}: ${f.text}`).join('\n')}` : '';
  };
  return [`Today: ${now}`, about && `About: ${about}`, block('current'), block('recent'), block('upcoming')].filter(Boolean).join('\n\n');
}

/* ---------- streaming ---------- */

let running = 0;
/** The last note that finished, served when the model is busy or down. */
let lastNote: string | undefined;

/** Text up to and including the MAX_SENTENCES-th sentence, and whether it got that far. */
function clip(text: string): { text: string; full: boolean } {
  const ends = [...text.matchAll(/[.!?](?=\s|$)/g)];
  if (ends.length < MAX_SENTENCES) return { text, full: false };
  return { text: text.slice(0, ends[MAX_SENTENCES - 1].index! + 1), full: true };
}

/**
  The note as a stream of plain-text chunks, or undefined when there's nothing to say and no
  earlier note to fall back on. Cancelling the stream (the visitor left) stops the generation.
*/
export async function streamNow(): Promise<{ body: ReadableStream<Uint8Array>; source: 'model' | 'last' } | undefined> {
  const encode = (s: string) => new TextEncoder().encode(s);
  const replay = () => {
    const note = lastNote;
    return note ? { body: new ReadableStream<Uint8Array>({ start(c) { c.enqueue(encode(note)); c.close(); } }), source: 'last' as const } : undefined;
  };

  if (running >= MAX_RUNNING) return replay();
  const prompt = await attempt(nowPrompt);
  if (!prompt) return replay();

  running++;
  let released = false;
  const release = () => { if (!released) { released = true; running--; } };

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(new Error('timed out')), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: true, keep_alive: '30m' }),
      signal: abort.signal,
    });
    if (!res.ok || !res.body) throw new Error(`Ollama ${res.status}`);
  } catch (err) {
    clearTimeout(timer);
    release();
    console.error(`[now] ${(err as Error).message}`);
    return replay();
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let pending = '';   // an NDJSON line not yet complete
  let note = '';      // everything sent so far
  const finish = () => { clearTimeout(timer); release(); };

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          if (note.trim()) lastNote = note.trim();
          finish();
          controller.close();
          return;
        }
        pending += value;
        const lines = pending.split('\n');
        pending = lines.pop()!;
        let chunk = '';
        let stop = false;
        for (const raw of lines) {
          if (!raw.trim()) continue;
          const msg = JSON.parse(raw) as { response?: string; done?: boolean; error?: string };
          if (msg.error) throw new Error(msg.error);
          chunk += msg.response ?? '';
          if (msg.done) stop = true;
        }
        // No leading whitespace, and nothing past the last allowed sentence.
        const { text, full } = clip((note + chunk).trimStart());
        const next = text.slice(note.length);
        if (next) controller.enqueue(encode(next));
        note = text;
        if (full || stop) {
          if (note.trim()) lastNote = note.trim();
          finish();
          abort.abort();
          controller.close();
        }
      } catch (err) {
        console.error(`[now] ${(err as Error).message}`);
        finish();
        abort.abort();
        controller.error(err);
      }
    },
    cancel() {
      finish();
      abort.abort();
    },
  });

  return { body, source: 'model' };
}
