
import { useState, useEffect, useCallback } from 'react';

export const useAutoRefresh = (storageKey: string, fetchFn: () => Promise<any>) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecentCheckpoint = () => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Checkpoints are Monday (1) and Thursday (4)
    const checkpoints = [1, 4];
    
    let lastCheckpoint = new Date(now);
    lastCheckpoint.setHours(0, 0, 0, 0);
    
    // Find the most recent checkpoint day that is <= today
    const pastCheckpoints = checkpoints.filter(d => d <= day).sort((a, b) => b - a);
    
    if (pastCheckpoints.length > 0) {
      lastCheckpoint.setDate(now.getDate() - (day - pastCheckpoints[0]));
    } else {
      // If no checkpoint earlier this week, go to Thursday of last week
      lastCheckpoint.setDate(now.getDate() - (day + 3)); // day + (7 - 4)
    }
    
    return lastCheckpoint.getTime();
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
