import { useCallback, useEffect, useState } from 'react';
import { toApiErrorMessage } from '../../../shared/api';
import { listServices, type Service } from '../api';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listServices();
      setServices(data);
    } catch (err) {
      setServices([]);
      setError(toApiErrorMessage(err, 'Failed to load services'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { services, loading, error, refetch };
}
