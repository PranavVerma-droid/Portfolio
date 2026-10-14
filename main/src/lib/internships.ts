/* The `internships` collection. internshipImg, class and author are not used. */
import { list, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { toLinks } from './links';
import { isoDate, year } from './format';

interface InternshipRecord extends BaseRecord {
  internshipName: string;
  internshipDescription: string;
  internshipInstituteName: string;
  internshipType: string;
  internshipStartDate: string;
  internshipEndDate: string;
  internshipAdditionalUrl1: string;
  internshipAdditionalUrl2: string;
  internshipAdditionalUrl3: string;
}

export interface Internship {
  id: string;
  title: string;
  institute: string;
  /** "remote", "hybrid", … lowercased, or "". */
  type: string;
  /** Sanitized HTML. */
  description: string;
  /** YYYY-MM-DD, or "". */
  start: string;
  end: string;
  year: string;
  links: { href: string; label: string }[];
}

export async function getInternships(): Promise<Internship[]> {
  const records = await list<InternshipRecord>('internships');
  return records
    .map((r): Internship => {
      const start = r.internshipStartDate ? isoDate(r.internshipStartDate) : '';
      const end = r.internshipEndDate ? isoDate(r.internshipEndDate) : '';
      return {
        id: r.id,
        title: r.internshipName,
        institute: r.internshipInstituteName ?? '',
        type: (r.internshipType ?? '').trim().toLowerCase(),
        description: richOrPlain(r.internshipDescription),
        start,
        end,
        year: year(start || end),
        links: toLinks([r.internshipAdditionalUrl1, r.internshipAdditionalUrl2, r.internshipAdditionalUrl3]),
      };
    })
    .sort((a, b) => b.start.localeCompare(a.start) || a.title.localeCompare(b.title));
}
