import type { EditionDraft } from './editor';

/**
 * Optional: let a free-tier model write the briefing. Set GROQ_API_KEY or
 * GEMINI_API_KEY. With neither, the rule-based briefing is used and the paper
 * still prints. Any failure here falls back the same way.
 */
export async function aiBriefing(e: EditionDraft): Promise<{ paragraphs: string[]; by: string } | null> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKey && !geminiKey) return null;

  const facts = {
    lead: { title: e.lead.title, source: e.lead.source, note: e.lead.blurb },
    stories: e.stories.slice(0, 12).map((s) => ({ title: s.title, source: s.source, note: s.blurb })),
    repos: e.repos.slice(0, 6).map((r) => ({ name: r.name, stars: r.stars, gain: r.gain, about: r.description })),
    advisories: e.advisories.slice(0, 5).map((a) => ({ severity: a.severity, summary: a.summary })),
    jobs: { open: e.jobsTotal, new: e.jobsNew },
  };
  const prompt =
    `You are the desk editor of a developer newspaper writing the ${e.slot} briefing. ` +
    'Write exactly three short paragraphs of plain text, about 110 words in total, in a calm newspaper voice. ' +
    'Use only the facts in the JSON below. Do not invent numbers, names, quotes or events. No markdown, no headings, no lists.\n\n' +
    JSON.stringify(facts);

  try {
    let text = '';
    let by = '';
    if (groqKey) {
      by = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: by, temperature: 0.4, max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
      text = ((await res.json()) as any).choices?.[0]?.message?.content ?? '';
    } else {
      by = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${by}:generateContent`, {
        method: 'POST',
        headers: { 'x-goog-api-key': geminiKey!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 400 } }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      text = ((await res.json()) as any).candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
    }
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 30)
      .slice(0, 3);
    return paragraphs.length ? { paragraphs, by } : null;
  } catch (err) {
    console.warn(`  ✗ AI briefing skipped: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
