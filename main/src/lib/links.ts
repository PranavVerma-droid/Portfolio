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

export function linkLabel(href: string): string {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return HOST_LABELS[host] ?? host;
  } catch {
    return href;
  }
}

/** URLs with labels, empty ones dropped. */
export const toLinks = (urls: (string | undefined)[]) =>
  urls.filter((u): u is string => !!u).map((href) => ({ href, label: linkLabel(href) }));
