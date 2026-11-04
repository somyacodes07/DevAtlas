export let lastConnectError: string | null = null;

// Memory cache for Edge isolate
let cachedItems: any[] | null = null;
let cachedRuns: any[] | null = null;
let cachedReports: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache

async function fetchEdgeJson(filename: string) {
  try {
    // We fetch directly from the public GitHub repo raw content for maximum edge scalability
    const res = await fetch(`https://raw.githubusercontent.com/somyacodes07/DevAtlas/main/data/${filename}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error(`Edge CDN Fetch Error for ${filename}:`, err);
    return [];
  }
}

async function refreshCacheIfNeeded() {
  if (Date.now() - lastFetchTime > CACHE_TTL || !cachedItems) {
    const [items, runs, reports] = await Promise.all([
      fetchEdgeJson('edge_items.json'),
      fetchEdgeJson('edge_runs.json'),
      fetchEdgeJson('edge_reports.json'),
    ]);
    cachedItems = Array.isArray(items) ? items : [];
    cachedRuns = Array.isArray(runs) ? runs : [];
    cachedReports = Array.isArray(reports) ? reports : [];
    lastFetchTime = Date.now();
  }
}

// Snapshot-backed collection adapter for the Worker runtime.
export async function getWorkerDb(uri?: string, databaseName?: string): Promise<any> {
  await refreshCacheIfNeeded();
  return { connected: true };
}

class MockCollection {
  constructor(private data: any[]) {}

  async countDocuments(filter: any = {}): Promise<number> {
    return this.applyFilter(filter).length;
  }

  async findOne(filter: any = {}, options: any = {}): Promise<any | null> {
    const results = this.applyFilter(filter);
    if (options.sort) {
      this.sortResults(results, options.sort);
    }
    return results.length > 0 ? this.project(results[0], options.projection) : null;
  }

  find(filter: any = {}, options: any = {}) {
    let results = this.applyFilter(filter);
    
    const cursor = {
      sort: (sortObj: any) => {
        this.sortResults(results, sortObj);
        return cursor;
      },
      skip: (s: number) => {
        results = results.slice(s);
        return cursor;
      },
      limit: (l: number) => {
        results = results.slice(0, l);
        return cursor;
      },
      toArray: async () => {
        return results.map((item) => this.project(item, options.projection));
      }
    };
    return cursor;
  }

  private applyFilter(filter: any): any[] {
    if (!filter || Object.keys(filter).length === 0) return [...this.data];
    return this.data.filter((item) => Object.entries(filter).every(([key, expected]) => {
      if (key === '$text') {
        const query = String((expected as any)?.$search || '').toLowerCase();
        const haystack = [item.title, item.description, item.summary, item.content]
          .filter((value) => typeof value === 'string').join(' ').toLowerCase();
        return query.split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
      }

      const actual = key.split('.').reduce((value, segment) => value == null ? undefined : value[segment], item);
      if (expected instanceof RegExp) {
        expected.lastIndex = 0;
        return (Array.isArray(actual) ? actual : [actual]).some((value) => typeof value === 'string' && expected.test(value));
      }
      if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
        if ('$gte' in expected) return typeof actual === 'number' && actual >= (expected as any).$gte;
      }
      if (Array.isArray(actual)) return actual.includes(expected);
      return actual === expected;
    }));
  }

  private sortResults(results: any[], sortObj: any) {
    const keys = Object.keys(sortObj);
    if (!keys.length) return;
    results.sort((a, b) => {
      for (const key of keys) {
        const valA = key.split('.').reduce((value, segment) => value == null ? undefined : value[segment], a);
        const valB = key.split('.').reduce((value, segment) => value == null ? undefined : value[segment], b);
        if (valA < valB) return sortObj[key] === 1 ? -1 : 1;
        if (valA > valB) return sortObj[key] === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  private project(item: any, projection?: Record<string, 0 | 1>) {
    if (!projection) return item;
    const fields = Object.entries(projection);
    if (fields.some(([, include]) => include === 1)) {
      const result: Record<string, any> = {};
      for (const [key, include] of fields) {
        if (include !== 1) continue;
        const value = key.split('.').reduce((current, segment) => current == null ? undefined : current[segment], item);
        if (value !== undefined) result[key] = value;
      }
      if (projection._id !== 0 && item._id !== undefined) result._id = item._id;
      return result;
    }
    const result = { ...item };
    for (const [key, include] of fields) {
      if (include !== 0) continue;
      const segments = key.split('.');
      let parent = result;
      for (const segment of segments.slice(0, -1)) parent = parent?.[segment];
      if (parent) delete parent[segments[segments.length - 1]];
    }
    return result;
  }
}

export function getItemsCollection(db: any): any {
  return new MockCollection(cachedItems || []);
}

export function getRunsCollection(db: any): any {
  return new MockCollection(cachedRuns || []);
}

export function getReportsCollection(db: any): any {
  return new MockCollection(cachedReports || []);
}
