import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { getServiceAvailability, type TimeSlot } from '../api';
import { mapSlotsToOptions, type SlotOption } from '../lib/slotOptions';

export function useServiceAvailability(
  serviceId: number | null | undefined,
  dateYmd: string | null | undefined,
) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [options, setOptions] = useState<SlotOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled =
    serviceId != null &&
    Number.isFinite(serviceId) &&
    typeof dateYmd === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateYmd);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setSlots([]);
      setOptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getServiceAvailability(serviceId as number, dateYmd as string);
      setSlots(data);
      setOptions(mapSlotsToOptions(data));
    } catch (err) {
      setSlots([]);
      setOptions([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load availability',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, serviceId, dateYmd]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    slots,
    options,
    loading,
    error,
    empty: enabled && !loading && !error && options.length === 0,
    enabled,
    refetch,
  };
}
