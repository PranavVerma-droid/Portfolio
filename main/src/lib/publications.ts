/* The `publications` collection. publicationImg is not used. */
import { list, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { toLinks } from './links';
import { isoDate, year } from './format';

interface PublicationRecord extends BaseRecord {
  publicationName: string;
  publicationDescription: string;
  publicationJournal: string;
  publicationDate: string;
  publicationLink1: string;
  publicationLink2: string;
  publicationLink3: string;
  publicationLink4: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  /** YYYY-MM-DD, or "". */
  date: string;
  year: string;
  /** Sanitized HTML. */
  description: string;
  links: { href: string; label: string }[];
}

export async function getPublications(): Promise<Publication[]> {
  const records = await list<PublicationRecord>('publications');
  return records
    .map((r): Publication => {
      const date = r.publicationDate ? isoDate(r.publicationDate) : '';
      return {
        id: r.id,
        title: r.publicationName,
        journal: r.publicationJournal ?? '',
        date,
        year: year(date),
        description: richOrPlain(r.publicationDescription),
        links: toLinks([r.publicationLink1, r.publicationLink2, r.publicationLink3, r.publicationLink4]),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
