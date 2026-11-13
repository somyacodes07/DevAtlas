import { createHash } from 'node:crypto';
import type { Desk, SourceReport } from './types';

export const UA = 'DevAtlasBot/2.0 (+https://github.com/somyacodes07/DevAtlas)';

interface FetchOpts {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
}

async function request(url: string, opts: FetchOpts = {}): Promise<Response> {
  const { headers = {}, timeoutMs = 10_000, retries = 1 } = opts;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, ...headers },
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'follow',
      });
      if (res.status >= 500 && attempt < retries) continue;
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function getJson<T>(url: string, opts?: FetchOpts): Promise<T> {
  const res = await request(url, { ...opts, headers: { Accept: 'application/json', ...opts?.headers } });
  return (await res.json()) as T;
}

export async function getText(url: string, opts?: FetchOpts): Promise<string> {
  return (await request(url, opts)).text();
}

/** Run one source, never throw: a dead source must not stop the presses. */
export async function runSource<T>(
  name: string,
  fn: () => Promise<T[]>,
  reports: SourceReport[],
): Promise<T[]> {
  const started = Date.now();
  try {
    const items = await fn();
    reports.push({ name, ok: true, count: items.length, ms: Date.now() - started });
    return items;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    reports.push({ name, ok: false, count: 0, ms: Date.now() - started, error });
    console.warn(`  ✗ ${name}: ${error}`);
    return [];
  }
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…',
  mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  const text = html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(decodeEntities(text)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Cut at a word boundary and close with an ellipsis. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > max * 0.6 ? space : cut.length).replace(/[\s,;:.–—-]+$/, '')}…`;
}

const TRACKING = /^(utm_|ref$|ref_|fbclid$|gclid$|mc_|source$|campaign$)/i;

export function canonicalUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING.test(key)) url.searchParams.delete(key);
    }
    let out = url.toString();
    if (url.pathname !== '/' && out.endsWith('/')) out = out.slice(0, -1);
    return out;
  } catch {
    return raw.trim();
  }
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function hashId(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 12);
}

export function toIso(value: unknown, fallback = new Date()): string {
  const date =
    typeof value === 'number' ? new Date(value < 1e12 ? value * 1000 : value) : new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
}

const DESK_RULES: Array<[Desk, RegExp]> = [
  ['security', /\b(cve|vulnerab\w*|exploit\w*|breach\w*|malware|ransomware|zero[- ]day|backdoor|phishing|security|hacked|supply[- ]chain attack)\b/i],
  ['ai', /\b(ai|a\.i\.|llms?|gpt[\w.-]*|claude|gemini|openai|anthropic|mistral|deepseek|agents?|agentic|transformers?|diffusion|machine learning|neural|inference|fine[- ]tun\w*|rag|mcp)\b/i],
  ['systems', /\b(rust|kernel|linux|compilers?|postgres\w*|sqlite|databases?|kubernetes|docker|wasm|webassembly|zig|golang|c\+\+|memory|cpu|gpu|risc-v|embedded|firmware|distributed|unix|bsd)\b/i],
  ['web', /\b(javascript|typescript|react|vue|svelte|css|html|browsers?|chrome|firefox|safari|node\.?js|deno|bun|next\.?js|frontend|web ?dev\w*|http|api)\b/i],
];

export function deskFor(text: string): Desk {
  for (const [desk, pattern] of DESK_RULES) if (pattern.test(text)) return desk;
  return 'general';
}
