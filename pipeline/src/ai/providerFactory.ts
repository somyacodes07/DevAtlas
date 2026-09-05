import { AIProvider } from './aiProvider';
import { MockAIProvider } from './mockProvider';
import { DeterministicRuleProvider } from './deterministicRuleProvider';
import { GroqAIProvider } from './groqProvider';

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || '').toLowerCase();
  const groqApiKey = process.env.GROQ_API_KEY || (providerType === 'groq' ? process.env.AI_API_KEY : '');

  if (providerType === 'groq' || groqApiKey) {
    if (!groqApiKey) {
      console.log('[AI Engine] Note: AI_PROVIDER=groq is set, but GROQ_API_KEY is empty in .env');
      console.log('            Get a free key from https://console.groq.com/keys and paste it in .env');
      console.log('            Active fallback: Deterministic Rule-Based Engine (Zero Cost)\n');
      return new DeterministicRuleProvider();
    }
    return new GroqAIProvider(groqApiKey);
  }

  switch (providerType) {
    case 'mock':
      return new MockAIProvider();
    case 'deterministic':
    default:
      return new DeterministicRuleProvider();
  }
}

