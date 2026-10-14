/* The `certificates` collection, as chips: name, link, and "issuer · date" for the hover card. certificateImg is not used. */
import { list, type BaseRecord } from './pb';
import { isoDate, stripHtml } from './format';
import type { Chip } from './skills';

interface CertificateRecord extends BaseRecord {
  certificateName: string;
  certificateIssue: string;
  certificateIssueDate: string;
  certificateUrl: string;
  certificateImg: string;
}

export async function getCertificates(): Promise<Chip[]> {
  const records = await list<CertificateRecord>('certificates');
  return records
    .map((r) => ({ r, date: r.certificateIssueDate ? isoDate(r.certificateIssueDate) : '' }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.r.certificateName.localeCompare(b.r.certificateName))
    .map(({ r, date }) => ({
      id: r.id,
      name: stripHtml(r.certificateName ?? ''),
      description: [stripHtml(r.certificateIssue ?? ''), date].filter(Boolean).join(' · '),
      href: /^https?:\/\//.test(r.certificateUrl ?? '') ? r.certificateUrl : '',
    }));
}
