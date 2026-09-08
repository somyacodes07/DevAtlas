import { DiscoveredItem, ContentItem } from '../types';
import { AIClassificationResult, AIProvider } from './aiProvider';
import { DeterministicRuleProvider } from './deterministicRuleProvider';
import { stripEmojis } from '../normalization/normalizer';

export class GeminiAIProvider implements AIProvider {
  name = 'Gemini Intelligence Engine (1.5 Flash)';
  private apiKey: string;
  private model: string;
  private fallbackProvider: DeterministicRuleProvider;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
    this.model = model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.fallbackProvider = new DeterministicRuleProvider();
  }

  private lastCallTime = 0;

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    jsonMode = true,
    maxTokens = 600,
    canRetry = true
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Rate limiting: 15 RPM for free tier (4s interval)
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < 4000) {
      await new Promise((resolve) => setTimeout(resolve, 4000 - elapsed));
    }
    this.lastCallTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: maxTokens,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        }),
        signal: controller.signal,
      });

      if (response.status === 429 && canRetry) {
        // Wait 5 seconds and retry once
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return this.callGemini(systemPrompt, userPrompt, jsonMode, maxTokens, false);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini returned empty content');
      }

      return stripEmojis(content.trim());
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult> {
    if (!this.apiKey) {
      return this.fallbackProvider.classifyAndSummarize(item);
    }

    try {
      const systemPrompt = `You are DevAtlas Intelligence, a senior software analyst and technical recruiter.
Analyze developer items (jobs, open-source repositories, developer tools, AI frameworks, tech news).
Produce accurate, concise, fluff-free technical metadata.
CRITICAL RULE: Never use emojis under any circumstances.

Output strictly valid JSON with this schema:
{
  "category": "string (e.g. AI & Machine Learning, Open Source Software, Careers & Engineering Roles, Developer Tools, Cybersecurity & Supply Chain)",
  "tags": ["3 to 6 precise lowercase tags, e.g. 'react', 'typescript', 'rust', 'distributed-systems'"],
  "summary": "1 to 2 clear, technical sentences explaining the core architecture, capabilities, or job requirements."
}`;

      const userPrompt = `Item to analyze:
Type: ${item.type}
Title: ${item.title}
Source: ${item.sourceName} (${item.sourceType})
Details: ${item.description.slice(0, 1000)}
${item.metadata ? `Metadata: ${JSON.stringify(item.metadata).slice(0, 500)}` : ''}`;

      const rawJson = await this.callGemini(systemPrompt, userPrompt, true, 300);

      const parsed = JSON.parse(rawJson);
      const category = stripEmojis(parsed.category || 'Developer Tools');
      const tags = Array.isArray(parsed.tags)
        ? parsed.tags.map((t: string) => stripEmojis(String(t).toLowerCase().trim())).filter(Boolean)
        : ['developer-tools'];
      const summary = stripEmojis(parsed.summary || item.description || item.title);

      return {
        category,
        tags,
        summary,
      };
    } catch (err) {
      console.warn(`[Gemini Warning] Classification fallback for "${item.title.slice(0, 30)}...":`, err instanceof Error ? err.message : String(err));
      return this.fallbackProvider.classifyAndSummarize(item);
    }
  }

  async generateExecutiveSummary(items: ContentItem[], dateStr: string): Promise<string> {
    if (!this.apiKey || items.length === 0) {
      return '';
    }

    try {
      const topItemsSummary = items.slice(0, 15).map((it) => {
        return `- [${it.type}] ${it.title} (${it.category}): ${it.summary || it.description}`;
      }).join('\n');

      const systemPrompt = `You are the Chief Technology Intelligence Analyst for DevAtlas.
Write an executive daily intelligence briefing for software developers, CTOs, and engineering job seekers for ${dateStr}.
Synthesize the top developments into three concise markdown sections:
1. **Ecosystem & AI Velocity**: Key technological breakthroughs, model releases, and tool migrations.
2. **Open Source & Infrastructure**: High-growth libraries, compiler/runtime updates, and developer tooling.
3. **Engineering Talent Radar**: In-demand engineering stacks, hiring patterns, and standout roles.

CRITICAL RULE:
- Do NOT use ANY emojis whatsoever.
- Keep the tone analytical, high-density, and professional.
- Max 3 short paragraphs total.`;

      const userPrompt = `Here are the top discoveries from the pipeline today:\n${topItemsSummary}`;

      const briefing = await this.callGemini(systemPrompt, userPrompt, false, 600);

      return stripEmojis(briefing);
    } catch (err) {
      console.warn('[Gemini Warning] Executive summary generation failed, skipping:', err instanceof Error ? err.message : String(err));
      return '';
    }
  }
}
