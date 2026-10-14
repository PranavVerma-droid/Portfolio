/* The `socialwork` collection (volunteering). socialWorkImg and class are not used. */
import { list, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { toLinks } from './links';
import { isoDate, year } from './format';

interface SocialWorkRecord extends BaseRecord {
  socialWorkName: string;
  socialWorkDescription: string;
  socialWorkInstituteName: string;
  socialWorkStartDate: string;
  socialWorkEndDate: string;
  socialWorkAdditionalUrl1: string;
  socialWorkAdditionalUrl2: string;
  socialWorkAdditionalUrl3: string;
}

export interface SocialWork {
  id: string;
  title: string;
  institute: string;
  /** Sanitized HTML. */
  description: string;
  /** YYYY-MM-DD, or "". */
  start: string;
  end: string;
  year: string;
  links: { href: string; label: string }[];
}

export async function getSocialWork(): Promise<SocialWork[]> {
  const records = await list<SocialWorkRecord>('socialwork');
  return records
    .map((r): SocialWork => {
      const start = r.socialWorkStartDate ? isoDate(r.socialWorkStartDate) : '';
      const end = r.socialWorkEndDate ? isoDate(r.socialWorkEndDate) : '';
      return {
        id: r.id,
        title: r.socialWorkName,
        institute: r.socialWorkInstituteName ?? '',
        description: richOrPlain(r.socialWorkDescription),
        start,
        end,
        year: year(start || end),
        links: toLinks([r.socialWorkAdditionalUrl1, r.socialWorkAdditionalUrl2, r.socialWorkAdditionalUrl3]),
      };
    })
    .sort((a, b) => b.start.localeCompare(a.start) || a.title.localeCompare(b.title));
}
