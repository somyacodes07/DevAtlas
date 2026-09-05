import { AIProvider } from './aiProvider';
import { MockAIProvider } from './mockProvider';
import { DeterministicRuleProvider } from './deterministicRuleProvider';
import { GroqAIProvider } from './groqProvider';

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || '').toLowerCase();
  const groqApiKey = process.env.GROQ_API_KEY || (providerType === 'groq' ? process.env.AI_API_KEY : '');

  // If explicitly set to groq, or GROQ_API_KEY is present and provider is not mock/deterministic
  if (providerType === 'groq' || (groqApiKey && providerType !== 'mock' && providerType !== 'deterministic')) {
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

