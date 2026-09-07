import { DiscoveredItem, ContentItem } from '../types';
import { AIClassificationResult, AIProvider } from './aiProvider';
import { DeterministicRuleProvider } from './deterministicRuleProvider';
import { stripEmojis } from '../normalization/normalizer';

export class GroqAIProvider implements AIProvider {
  name = 'Groq Intelligence Engine (Mixtral 8x7b)';
  private apiKey: string;
  private model: string;
  private fallbackProvider: DeterministicRuleProvider;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || process.env.AI_API_KEY || '';
    this.model = model || process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
    this.fallbackProvider = new DeterministicRuleProvider();
  }

  private lastCallTime = 0;

  private async callGroq(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = true,
    maxTokens = 600,
    canRetry = true
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // Pace requests to stay within Groq free-tier 30 RPM limit (2s interval)
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < 2050) {
      await new Promise((resolve) => setTimeout(resolve, 2050 - elapsed));
    }
    this.lastCallTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: controller.signal,
      });

      if (response.status === 404 && this.model !== 'mixtral-8x7b-32768') {
        console.warn(`[Groq Warning] Model "${this.model}" not available on this tier. Auto-switching to "mixtral-8x7b-32768"...`);
        this.model = 'mixtral-8x7b-32768';
        return this.callGroq(messages, jsonMode, maxTokens, canRetry);
      }

      if (response.status === 429 && canRetry) {
        // Wait 3 seconds and retry once
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return this.callGroq(messages, jsonMode, maxTokens, false);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq returned empty content');
      }

      return stripEmojis(content.trim());
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult> {
    // If no API key configured, use deterministic fallback
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

      const rawJson = await this.callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], true, 300);

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
      console.warn(`[Groq Warning] Classification fallback for "${item.title.slice(0, 30)}...":`, err instanceof Error ? err.message : String(err));
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

      const briefing = await this.callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], false, 600);

      return stripEmojis(briefing);
    } catch (err) {
      console.warn('[Groq Warning] Executive summary generation failed, skipping:', err instanceof Error ? err.message : String(err));
      return '';
    }
  }
}
