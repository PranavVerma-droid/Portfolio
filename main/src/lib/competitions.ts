/* The `competitions` collection. class and author are not used. */
import { list, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { toLinks } from './links';
import { isoDate, year } from './format';

interface CompetitionRecord extends BaseRecord {
  competitionName: string;
  competitionDescription: string;
  competitionWon: boolean;
  competitionParticipationDate: string;
  competitionAdditionalUrl1: string;
  competitionAdditionalUrl2: string;
  competitionAdditionalUrl3: string;
  competitionAdditionalUrl4: string;
}

export interface Competition {
  id: string;
  title: string;
  won: boolean;
  /** YYYY-MM-DD, or "". */
  date: string;
  year: string;
  /** Sanitized HTML, or "". */
  description: string;
  links: { href: string; label: string }[];
}

export async function getCompetitions(): Promise<Competition[]> {
  const records = await list<CompetitionRecord>('competitions');
  return records
    .map((r): Competition => {
      const date = r.competitionParticipationDate ? isoDate(r.competitionParticipationDate) : '';
      return {
        id: r.id,
        title: (r.competitionName ?? '').replace(/\s+/g, ' ').trim(),
        won: !!r.competitionWon,
        date,
        year: year(date),
        description: richOrPlain(r.competitionDescription),
        links: toLinks([r.competitionAdditionalUrl1, r.competitionAdditionalUrl2, r.competitionAdditionalUrl3, r.competitionAdditionalUrl4]),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
