import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { getService, type Service } from '../api';

export function useService(serviceId: number | null | undefined) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (serviceId == null || !Number.isFinite(serviceId)) {
      setService(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getService(serviceId);
      setService(data);
    } catch (err) {
      setService(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load service',
      );
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { service, loading, error, refetch };
}
