import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api';
import {
  listAppointments,
  type Appointment,
  type AppointmentStatus,
  type ListAppointmentsQuery,
} from '../api';

export type UseAppointmentsFilters = {
  status?: AppointmentStatus | '';
  from?: string;
  to?: string;
  page?: number;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function normalizeFilters(
  filters: UseAppointmentsFilters = {},
): ListAppointmentsQuery {
  const query: ListAppointmentsQuery = {};

  if (filters.status) query.status = filters.status;
  if (filters.from) query.from = filters.from;
  if (filters.to) query.to = filters.to;
  if (filters.page && filters.page > 0) query.page = filters.page;

  return query;
}

export function useAppointments(filters: UseAppointmentsFilters = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = filters.status || undefined;
  const from = filters.from || undefined;
  const to = filters.to || undefined;
  const page = filters.page || 1;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listAppointments(
        normalizeFilters({ status, from, to, page }),
      );
      setAppointments(result.data);
      setMeta({
        current_page: result.meta.current_page,
        last_page: result.meta.last_page ?? result.meta.current_page,
        per_page: result.meta.per_page,
        total: result.meta.total,
      });
    } catch (err) {
      setAppointments([]);
      setMeta(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load appointments',
      );
    } finally {
      setLoading(false);
    }
  }, [status, from, to, page]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    appointments,
    meta,
    loading,
    error,
    refetch,
  };
}
