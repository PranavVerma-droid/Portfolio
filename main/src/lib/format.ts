/* Date and text helpers. Date forms follow the design system: 2026 (index), Oct 14 (list), 2026-10-14 (metadata). */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** PocketBase dates look like "2026-10-02 00:00:00.000Z". */
export const isoDate = (pb: string) => pb.slice(0, 10);
export const year = (pb: string) => pb.slice(0, 4);
/** "2024-06 → 2024-08", "2026-09 → present", or "" when there are no dates. */
export const monthRange = (start: string, end: string) =>
  start || end ? `${start.slice(0, 7) || '?'} → ${end ? end.slice(0, 7) : 'present'}` : '';
export const monthDay = (pb: string) => `${MONTHS[Number(pb.slice(5, 7)) - 1]} ${pb.slice(8, 10)}`;

/** One format per list: "Oct 02" when every date is in the same year, else the year. */
export function listDate(dates: string[]): (pb: string) => string {
  const years = new Set(dates.map(year));
  return years.size <= 1 ? monthDay : year;
}

/** Group items by year, newest first. */
export function byYear<T>(items: T[], date: (t: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const y = year(date(item));
    groups.set(y, [...(groups.get(y) ?? []), item]);
  }
  return [...groups].sort((a, b) => b[0].localeCompare(a[0]));
}

export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

/** Rich text from PocketBase: mark external links with ↗ and open them in a new tab, like TextLink. */
export function externalLinks(html: string): string {
  return html.replace(/<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi, (_m, attrs: string, text: string) => {
    const clean = attrs.replace(/\s*(target|rel)="[^"]*"/gi, '');
    return `<a ${clean} target="_blank" rel="noopener noreferrer">${text}<span class="arrow" aria-label=" (opens in a new tab)">↗</span></a>`;
  });
}
