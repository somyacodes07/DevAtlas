import { DiscoveredItem, DiscoverySource } from '../types';

export class HackerNewsDiscoverySource implements DiscoverySource {
  name = 'Hacker News Public API';
  type = 'HACKER_NEWS' as const;

  async discover(): Promise<DiscoveredItem[]> {
    try {
      const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
        signal: AbortSignal.timeout(6000),
      });

      if (!topRes.ok) return [];
      const topIds = ((await topRes.json()) as number[]).slice(0, 8);

      const items: DiscoveredItem[] = [];

      await Promise.all(
        topIds.map(async (id) => {
          try {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
              signal: AbortSignal.timeout(4000),
            });
            if (!itemRes.ok) return;
            const item = (await itemRes.json()) as any;

            if (item && item.url && item.title) {
              const isAi = /\b(ai|llm|gpt|claude|openai|model|agent)\b/i.test(item.title);
              const type = isAi ? 'AI_TOOL' : 'NEWS';

              items.push({
                type,
                title: item.title,
                description: `Shared on Hacker News with ${item.score || 0} points and ${item.descendants || 0} comments.`,
                url: item.url,
                sourceName: this.name,
                sourceType: this.type,
                publishedAt: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
                metadata: {
                  hnPoints: item.score,
                  hnComments: item.descendants,
                },
              });
            }
          } catch {
            // Ignore single item failure
          }
        })
      );

      return items;
    } catch (err: unknown) {
      console.warn(`[HackerNewsSource Error] ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }
}
