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

// Mock Database object so we don't break routes
export async function getWorkerDb(uri?: string, databaseName?: string): Promise<any> {
  await refreshCacheIfNeeded();
  return { connected: true };
}

// Mock Collection implementation
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
    return results.length > 0 ? results[0] : null;
  }

  find(filter: any = {}) {
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
        return results;
      }
    };
    return cursor;
  }

  private applyFilter(filter: any): any[] {
    if (!filter || Object.keys(filter).length === 0) return [...this.data];
    return this.data.filter(item => {
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  private sortResults(results: any[], sortObj: any) {
    const key = Object.keys(sortObj)[0];
    if (!key) return;
    const direction = sortObj[key];
    
    results.sort((a, b) => {
      // Support nested keys like 'score.total'
      const valA = key.split('.').reduce((o, i) => o ? o[i] : undefined, a);
      const valB = key.split('.').reduce((o, i) => o ? o[i] : undefined, b);
      
      if (valA < valB) return direction === 1 ? -1 : 1;
      if (valA > valB) return direction === 1 ? 1 : -1;
      return 0;
    });
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
