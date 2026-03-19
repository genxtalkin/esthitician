
import { useState, useEffect, useCallback } from 'react';

export const useAutoRefresh = (storageKey: string, fetchFn: () => Promise<any>) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecentCheckpoint = (): number => {
    const now = new Date();

    // Parse current time in Eastern timezone using the locale trick.
    // etNow has the correct ET hour/day but its internal UTC value is wrong
    // (it treats the ET string as local time). The offset corrects for this.
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const etOffset = now.getTime() - etNow.getTime(); // ms to add to etNow to get real UTC

    const day = etNow.getDay();   // 0 = Sun … 6 = Sat, in ET
    const hour = etNow.getHours(); // current hour in ET

    const checkpointDays = [1, 4]; // Monday, Thursday

    // Walk back up to 7 days to find the most recent checkpoint that has passed
    for (let i = 0; i <= 7; i++) {
      const candidateDay = ((day - i) % 7 + 7) % 7;
      if (!checkpointDays.includes(candidateDay)) continue;
      // If the checkpoint is today but it's before 4am ET, keep looking
      if (i === 0 && hour < 4) continue;

      // Build the checkpoint moment: i days ago at 04:00:00 ET
      const cp = new Date(etNow);
      cp.setDate(cp.getDate() - i);
      cp.setHours(4, 0, 0, 0);

      // Return as real UTC ms
      return cp.getTime() + etOffset;
    }

    // Fallback (should never be reached): 7 days ago
    return now.getTime() - 7 * 24 * 60 * 60 * 1000;
  };

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(storageKey);
      const lastUpdated = localStorage.getItem(`${storageKey}_lastUpdated`);
      const recentCheckpoint = getRecentCheckpoint();

      if (!force && cached && lastUpdated && parseInt(lastUpdated) > recentCheckpoint) {
        setData(JSON.parse(cached));
      } else {
        const result = await fetchFn();
        setData(result);
        localStorage.setItem(storageKey, JSON.stringify(result));
        localStorage.setItem(`${storageKey}_lastUpdated`, Date.now().toString());
      }
    } catch (err: any) {
      const errorMessage = err.message || String(err);
      console.error(err);
      setError(`Failed to fetch data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [storageKey, fetchFn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refresh: () => loadData(true) };
};
