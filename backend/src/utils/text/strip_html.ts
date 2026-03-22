/**
 * Server-safe HTML stripping utilities (regex-based, NOT DOM API).
 * Node.js backend only — do NOT use document.createElement here.
 */

const HTML_ENTITIES: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
};

export function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;|&#\d+;/gi, (entity) => {
            if (entity in HTML_ENTITIES) return HTML_ENTITIES[entity];
            const numericMatch = entity.match(/&#(\d+);/);
            if (numericMatch) return String.fromCharCode(parseInt(numericMatch[1], 10));
            return entity;
        })
        .replace(/\s+/g, ' ')
        .trim();
}

export function getExcerpt(html: string | null | undefined, maxLength = 200): string {
    const text = stripHtml(html);
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
}
