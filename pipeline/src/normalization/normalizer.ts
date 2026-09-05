/**
 * DevAtlas Normalization Utilities
 * Cleans incoming text, normalizes titles, and standardizes timestamps.
 */

export function stripEmojis(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripHtml(input: string): string {
  if (!input) return '';
  const withoutHtml = input
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return stripEmojis(withoutHtml);
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  let cleaned = stripHtml(title);
  // Strip common aggregator prefixes
  cleaned = cleaned.replace(/^(Show HN|Ask HN|Tell HN):\s*/i, '');
  cleaned = cleaned.replace(/^Release:\s*/i, '');
  return stripEmojis(cleaned.trim());
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
