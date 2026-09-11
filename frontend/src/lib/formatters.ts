/**
 * Universal text and entity sanitizer for clean UI rendering.
 * Thoroughly removes unescaped HTML entities, HTML tags, and formatting artifacts.
 */
export function sanitizeText(text: string = ''): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Repeatedly decode double-escaped entities like &amp;lt; or &amp;quot;
  for (let i = 0; i < 3; i++) {
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

  // Normalize whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Returns clean company initials for avatar badge (e.g. "Datadog" -> "DD", "Google" -> "G")
 */
export function getCompanyInitials(name: string = ''): string {
  if (!name) return 'DA';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Returns a consistent gradient accent based on string hash for avatars
 */
export function getAvatarGradient(name: string = ''): string {
  const gradients = [
    'from-violet-600 to-indigo-600 text-white',
    'from-blue-600 to-cyan-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-amber-600 to-orange-600 text-white',
    'from-rose-600 to-pink-600 text-white',
    'from-purple-600 to-fuchsia-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

/**
 * Returns language color dot hex
 */
export function getLanguageColor(lang: string = ''): string {
  const map: Record<string, string> = {
    typescript: '#3178c6',
    javascript: '#f7df1e',
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
  return map[lang.toLowerCase()] || '#8b5cf6';
}
