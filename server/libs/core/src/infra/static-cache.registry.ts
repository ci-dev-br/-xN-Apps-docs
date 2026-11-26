export interface StaticFileCacheStats {
  instances: number;
  cachedFiles: number;
  keys: string[];
}

export interface StaticFileCacheClearResult {
  instances: number;
  clearedEntries: number;
}

export interface StaticFileCacheHandler {
  clearCache: () => { clearedEntries: number };
  getCacheStats: () => { cachedFiles: number; keys: string[] };
}

const REGISTRY_SYMBOL = Symbol.for('ci.apps.staticFileCacheRegistry');

function getRegistry(): Map<string, StaticFileCacheHandler> {
  const g = globalThis as Record<symbol, Map<string, StaticFileCacheHandler> | undefined>;
  if (!g[REGISTRY_SYMBOL]) {
    g[REGISTRY_SYMBOL] = new Map<string, StaticFileCacheHandler>();
  }
  return g[REGISTRY_SYMBOL]!;
}

export function registerStaticFileCacheHandler(
  id: string,
  handler: StaticFileCacheHandler,
): void {
  getRegistry().set(id, handler);
}

export function unregisterStaticFileCacheHandler(id: string): void {
  getRegistry().delete(id);
}

export function clearRegisteredStaticFileCaches(): StaticFileCacheClearResult {
  const registry = getRegistry();
  let clearedEntries = 0;
  for (const handler of registry.values()) {
    try {
      const res = handler.clearCache();
      clearedEntries += res?.clearedEntries || 0;
    } catch {
      // ignora erro isolado de instância
    }
  }
  return {
    instances: registry.size,
    clearedEntries,
  };
}

export function getRegisteredStaticFileCacheStats(): StaticFileCacheStats {
  const registry = getRegistry();
  let cachedFiles = 0;
  const keys: string[] = [];
  for (const handler of registry.values()) {
    try {
      const stats = handler.getCacheStats();
      cachedFiles += stats?.cachedFiles || 0;
      if (Array.isArray(stats?.keys)) {
        keys.push(...stats.keys);
      }
    } catch {
      // ignora erro isolado de instância
    }
  }
  return {
    instances: registry.size,
    cachedFiles,
    keys,
  };
}
