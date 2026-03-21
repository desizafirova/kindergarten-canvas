/**
 * Strips HTML tags from a string using DOM parsing for robustness.
 */
export function stripHtml(html: string | null): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}

export function getExcerpt(html: string | null, maxLength = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
