import { useCallback, useEffect, useState } from 'react';
import { toApiErrorMessage } from '../../../shared/api';
import { getAdminStats, type AdminStats } from '../api';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(toApiErrorMessage(err, 'Failed to load admin stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}
