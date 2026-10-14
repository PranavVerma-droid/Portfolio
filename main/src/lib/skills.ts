/* The `languages` and `skills` collections, as chips: name, link, and a description for the hover card. Images are not used. */
import { list, type BaseRecord } from './pb';
import { stripHtml } from './format';

interface LanguageRecord extends BaseRecord {
  languageName: string;
  languageDescription: string;
  languageSource: string;
  languageImg: string;
}

interface SkillRecord extends BaseRecord {
  skillName: string;
  skillDescription: string;
  skillUrl: string;
}

export interface Chip {
  id: string;
  name: string;
  /** Plain text, shown on hover or focus. */
  description: string;
  /** Opens in a new tab when the chip is clicked; "" means the chip isn't a link. */
  href: string;
}

const clean = (s: string | undefined) => stripHtml(s ?? '');
const url = (s: string | undefined) => (/^https?:\/\//.test(s ?? '') ? s! : '');

export async function getLanguages(): Promise<Chip[]> {
  return (await list<LanguageRecord>('languages')).map((r) => ({
    id: r.id, name: clean(r.languageName), description: clean(r.languageDescription), href: url(r.languageSource),
  }));
}

export async function getSkills(): Promise<Chip[]> {
  return (await list<SkillRecord>('skills')).map((r) => ({
    id: r.id, name: clean(r.skillName), description: clean(r.skillDescription), href: url(r.skillUrl),
  }));
}
