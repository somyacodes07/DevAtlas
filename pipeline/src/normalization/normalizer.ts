/**
 * DevAtlas Normalization Utilities
 * Cleans incoming text, normalizes titles, and standardizes timestamps.
 */

export function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  let cleaned = stripHtml(title);
  // Strip common aggregator prefixes
  cleaned = cleaned.replace(/^(Show HN|Ask HN|Tell HN):\s*/i, '');
  cleaned = cleaned.replace(/^Release:\s*/i, '');
  return cleaned.trim();
}

export function normalizeTimestamp(rawDate?: string | number): string {
  if (!rawDate) return new Date().toISOString();
  try {
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    // Prevent future timestamps beyond 24h skew
    const maxFuture = Date.now() + 24 * 60 * 60 * 1000;
    if (parsed.getTime() > maxFuture) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
