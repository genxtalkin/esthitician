
import { useState, useEffect, useCallback } from 'react';

export const useAutoRefresh = (storageKey: string, fetchFn: () => Promise<any>) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecentCheckpoint = (): number => {
    const now = new Date();
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const etOffset = now.getTime() - etNow.getTime();

    const day = etNow.getDay();
    const hour = etNow.getHours();
    const checkpointDays = [1, 4]; // Monday, Thursday

    for (let i = 0; i <= 7; i++) {
      const candidateDay = ((day - i) % 7 + 7) % 7;
      if (!checkpointDays.includes(candidateDay)) continue;
      if (i === 0 && hour < 4) continue;

      const cp = new Date(etNow);
      cp.setDate(cp.getDate() - i);
      cp.setHours(4, 0, 0, 0);
      return cp.getTime() + etOffset;
    }

    return now.getTime() - 7 * 24 * 60 * 60 * 1000;
  };

  const fetchFresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      localStorage.setItem(storageKey, JSON.stringify(result));
      localStorage.setItem(`${storageKey}_lastUpdated`, Date.now().toString());
    } catch (err: any) {
      setError(`Failed to fetch data: ${err.message || String(err)}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storageKey, fetchFn]);

  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    const lastUpdated = localStorage.getItem(`${storageKey}_lastUpdated`);
    const recentCheckpoint = getRecentCheckpoint();
    const cacheIsFresh = cached && lastUpdated && parseInt(lastUpdated) > recentCheckpoint;

    if (cached) {
      // Always show cached data immediately — no delay
      setData(JSON.parse(cached));
    }

    if (!cacheIsFresh) {
      // Cache is missing or stale — fetch in the background
      fetchFresh();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refresh: fetchFresh };
};
