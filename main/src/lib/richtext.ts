/*
  Rich text from PocketBase editor fields, made safe and on-design.

  Keeps structure (paragraphs, lists, headings, links, emphasis, code) and drops every
  inline style and colour, so text always uses the design tokens in both themes.
  A highlighted run (any span with a background colour) becomes <mark>, drawn in paper-tint.
*/
import sanitizeHtml from 'sanitize-html';
import { externalLinks } from './format';

const options: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'a', 'em', 'strong', 's', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h2', 'h3', 'mark', 'hr', 'sup', 'sub'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    b: 'strong',
    i: 'em',
    strike: 's',
    del: 's',
    h1: 'h2',
    h4: 'h3',
    h5: 'h3',
    h6: 'h3',
    span: (_tag, attribs) => ({
      tagName: /background/i.test(attribs.style ?? '') ? 'mark' : 'span',
      attribs: {},
    }),
  },
  // Empty paragraphs the editor leaves behind.
  exclusiveFilter: (frame) => frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren.length,
};

/** Like richText, but text with no HTML tags keeps its line breaks. */
export function richOrPlain(text: string | undefined | null): string {
  if (!text?.trim()) return '';
  if (/<[a-z][^>]*>/i.test(text)) return richText(text);
  const escaped = text.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return richText(escaped.split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join(''));
}

export function richText(html: string | undefined | null): string {
  if (!html) return '';
  return externalLinks(sanitizeHtml(html, options));
}
