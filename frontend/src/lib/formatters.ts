/**
 * Universal text and entity sanitizer for clean developer UI rendering.
 * Strictly removes all emojis, unescaped HTML entities, HTML tags, and formatting artifacts.
 */
export function stripEmojis(str: string = ''): string {
  if (!str) return '';
  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu,
      ''
    )
    .trim();
}

export function sanitizeText(text: string = ''): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Repeatedly decode double-escaped entities like &amp;lt; or &amp;quot;
  for (let i = 0; i < 4; i++) {
    cleaned = cleaned
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&#039;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/&#[0-9]+;/g, ' ');
  }

  // Strip all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Clean remaining stray entity fragments or escape sequences
  cleaned = cleaned.replace(/&[a-z0-9#]+;/gi, ' ');

  // Strip emojis
  cleaned = stripEmojis(cleaned);

  // Normalize whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Returns clean company initials for avatar badge (e.g. "Datadog" -> "DD", "Google" -> "GO")
 */
export function getCompanyInitials(name: string = ''): string {
  const clean = sanitizeText(name);
  if (!clean) return 'DA';
  const words = clean.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Returns language color dot hex (standard GitHub color palette)
 */
export function getLanguageColor(lang: string = ''): string {
  const map: Record<string, string> = {
    typescript: '#3178c6',
    javascript: '#f1e05a',
    python: '#3572A5',
    go: '#00ADD8',
    golang: '#00ADD8',
    rust: '#dea584',
    cpp: '#f34b7d',
    'c++': '#f34b7d',
    c: '#555555',
    java: '#b07219',
    ruby: '#701516',
    shell: '#89e051',
    bash: '#89e051',
    zig: '#ec915c',
  };
  return map[lang.toLowerCase()] || '#71717a';
}
