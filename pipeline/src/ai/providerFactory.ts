import { AIProvider } from './aiProvider';
import { MockAIProvider } from './mockProvider';
import { DeterministicRuleProvider } from './deterministicRuleProvider';

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || 'deterministic').toLowerCase();

  switch (providerType) {
    case 'mock':
      return new MockAIProvider();
    case 'deterministic':
    default:
      return new DeterministicRuleProvider();
  }
}
