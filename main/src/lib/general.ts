/* The `general` collection: a single record holding the about text and résumé. */
import { getOne, fileUrl, type BaseRecord } from './pb';
import { richText } from './richtext';
import { stripHtml } from './format';

const GENERAL_ID = 'mq08m3pb8cu9mfo';

interface GeneralRecord extends BaseRecord {
  about: string;         // rich text (HTML)
  tagline: string;
  resume: string;
  profilePic: string;
}

export interface General {
  /** About text as sanitized HTML. */
  about: string;
  /** About as plain text, for meta descriptions. */
  aboutText: string;
  /** Download link and file type ("pdf"), if a résumé is uploaded. */
  resume?: { href: string; type: string };
}

export async function getGeneral(): Promise<General | undefined> {
  const r = await getOne<GeneralRecord>('general', GENERAL_ID);
  if (!r) return undefined;
  const about = richText(r.about);
  return {
    about,
    aboutText: stripHtml(about.replace(/<span class="arrow"[^>]*>.*?<\/span>/g, '')),
    resume: r.resume
      ? { href: fileUrl(r, r.resume, { download: true }), type: r.resume.split('.').pop()?.toLowerCase() ?? '' }
      : undefined,
  };
}
