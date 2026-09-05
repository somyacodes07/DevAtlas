import { createHash } from 'node:crypto';

export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    // Remove common tracking parameters (utm_*, ref, fbclid, etc.)
    const searchParams = new URLSearchParams(parsed.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid', 'gclid'];
    for (const param of trackingParams) {
      searchParams.delete(param);
    }
    parsed.search = searchParams.toString();

    // Remove trailing slash for path consistency (except for root path)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();

    return parsed.toString();
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

export function hashSha256(content: string): string {
  return createHash('sha256').update(content.trim()).digest('hex');
}

export function computeUrlHash(url: string): string {
  return hashSha256(canonicalizeUrl(url));
}

export function computeContentHash(title: string, description: string): string {
  const normalized = `${title.trim().toLowerCase()}|${description.trim().toLowerCase()}`;
  return hashSha256(normalized);
}
