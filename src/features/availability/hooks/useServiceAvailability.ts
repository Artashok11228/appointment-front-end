import { useCallback, useEffect, useState } from 'react';
import { toApiErrorMessage } from '../../../shared/api';
import { isBookingOpenDayUtc } from '../../../shared/lib';
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

  const dateValid =
    typeof dateYmd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateYmd);
  const openDay = dateValid && isBookingOpenDayUtc(dateYmd as string);
  const enabled =
    serviceId != null &&
    Number.isFinite(serviceId) &&
    dateValid &&
    openDay;

  const refetch = useCallback(async () => {
    if (!dateValid || serviceId == null || !Number.isFinite(serviceId)) {
      setSlots([]);
      setOptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Closed / weekend: empty slots without calling the API.
    if (!openDay) {
      setSlots([]);
      setOptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getServiceAvailability(
        serviceId as number,
        dateYmd as string,
      );
      setSlots(data);
      setOptions(mapSlotsToOptions(data));
    } catch (err) {
      setSlots([]);
      setOptions([]);
      setError(toApiErrorMessage(err, 'Failed to load availability'));
    } finally {
      setLoading(false);
    }
  }, [dateValid, openDay, serviceId, dateYmd]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const daySelected =
    serviceId != null && Number.isFinite(serviceId) && dateValid;

  return {
    slots,
    options,
    loading,
    error,
    empty: daySelected && !loading && !error && options.length === 0,
    enabled,
    refetch,
  };
}
