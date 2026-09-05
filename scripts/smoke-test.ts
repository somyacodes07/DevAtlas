/**
 * DevAtlas Smoke Test Runner
 * Validates post-deployment health and schema conformance.
 */

const baseUrl = process.env.API_BASE_URL || 'http://localhost:8787';
console.log(`[Smoke Test] Target endpoint: ${baseUrl}`);

interface HealthResponse {
  status: string;
  version: string;
  services: {
    api: string;
  };
  requestId: string;
}

interface StatsResponse {
  data: {
    today: Record<string, number>;
    pipeline: {
      status: string;
    };
  };
}

async function runSmokeTests() {
  const failures: string[] = [];

  // 1. Check /api/v1/health
  try {
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    if (healthRes.status !== 200) {
      failures.push(`/api/v1/health returned HTTP ${healthRes.status} (expected 200)`);
    } else {
      const data = (await healthRes.json()) as HealthResponse;
      if (data.status !== 'UP' || data.services.api !== 'HEALTHY') {
        failures.push(`/api/v1/health payload unexpected: ${JSON.stringify(data)}`);
      } else {
        console.log(`✓ /api/v1/health operational [Status: ${data.status}, Version: ${data.version}]`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    failures.push(`/api/v1/health unreachable: ${message}`);
  }

  // 2. Check /api/v1/stats
  try {
    const statsRes = await fetch(`${baseUrl}/api/v1/stats`);
    if (statsRes.status !== 200) {
      failures.push(`/api/v1/stats returned HTTP ${statsRes.status} (expected 200)`);
    } else {
      const data = (await statsRes.json()) as StatsResponse;
      if (!data.data?.today || !data.data?.pipeline) {
        failures.push(`/api/v1/stats malformed payload: ${JSON.stringify(data)}`);
      } else {
        console.log(`✓ /api/v1/stats operational [Pipeline Status: ${data.data.pipeline.status}]`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    failures.push(`/api/v1/stats unreachable: ${message}`);
  }

  if (failures.length > 0) {
    console.error('\n❌ Smoke tests failed:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log('\n✅ All smoke tests passed successfully!');
}

runSmokeTests().catch((err) => {
  console.error('[Smoke Test Fatal]', err);
  process.exit(1);
});
