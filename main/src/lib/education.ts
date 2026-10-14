/*
  The `education` collection. eduType "education" is an institute attended; "score" is a test
  result (SAT, AP, IELTS…). eduLogo is not used.
*/
import { list, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { toLinks } from './links';
import { isoDate, monthRange, year } from './format';

interface EducationRecord extends BaseRecord {
  eduTitle: string;
  eduDescription: string;
  eduLogo: string;
  eduStartDate: string;
  eduEndDate: string;
  eduLink1: string;
  eduLink2: string;
  eduType: string;
}

export interface Education {
  id: string;
  title: string;
  /** Sanitized HTML. */
  description: string;
  /** YYYY-MM-DD, or "". */
  start: string;
  end: string;
  year: string;
  links: { href: string; label: string }[];
}

const toEducation = (r: EducationRecord): Education => {
  const start = r.eduStartDate ? isoDate(r.eduStartDate) : '';
  const end = r.eduEndDate ? isoDate(r.eduEndDate) : '';
  return {
    id: r.id,
    title: r.eduTitle,
    description: richOrPlain(r.eduDescription),
    start,
    end,
    year: year(start || end),
    links: toLinks([r.eduLink1, r.eduLink2]),
  };
};

const newestFirst = (a: Education, b: Education) => b.start.localeCompare(a.start) || a.title.localeCompare(b.title);

export async function getEducation(): Promise<{ institutes: Education[]; scores: Education[] }> {
  const records = await list<EducationRecord>('education');
  const of = (type: string) => records.filter((r) => r.eduType?.trim().toLowerCase() === type).map(toEducation).sort(newestFirst);
  return { institutes: of('education'), scores: of('score') };
}

/** An institute as an EntryIndex row: dates under the name, "current" while there's no end date. */
export const instituteEntry = (e: Education) => ({
  ...e,
  meta: monthRange(e.start, e.end) || undefined,
  status: e.start && !e.end ? 'current' : undefined,
});
