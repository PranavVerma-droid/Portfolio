/* Labels for external links: a short name for common hosts, else the domain. */

/* Short labels for the hosts that come up; anything else shows its domain. */
const HOST_LABELS: Record<string, string> = {
  'github.com': 'github',
  'gitlab.com': 'gitlab',
  'huggingface.co': 'hugging face',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'linkedin.com': 'linkedin',
  'reddit.com': 'reddit',
  'x.com': 'x',
  'twitter.com': 'x',
  'kaggle.com': 'kaggle',
  'devpost.com': 'devpost',
};

/** "pdf" for a link to a PDF, else a short host name ("github") or the domain. */
export function linkLabel(href: string): string {
  try {
    const url = new URL(href);
    if (/\.pdf$/i.test(decodeURIComponent(url.pathname))) return 'pdf';
    const host = url.hostname.replace(/^www\./, '');
    return HOST_LABELS[host] ?? host;
  } catch {
    return href;
  }
}

/** URLs with labels, empty ones dropped. Repeated labels are numbered: "pdf", "pdf 2". */
export function toLinks(urls: (string | undefined)[]) {
  const seen = new Map<string, number>();
  return urls.filter((u): u is string => !!u).map((href) => {
    const base = linkLabel(href);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { href, label: n > 1 ? `${base} ${n}` : base };
  });
}
