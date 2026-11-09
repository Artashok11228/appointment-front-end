import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { deleteService } from '../api';

export type DeleteServiceResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      status?: number;
    };

export function useDeleteService() {
  const [submitting, setSubmitting] = useState(false);

  const remove = useCallback(
    async (serviceId: number): Promise<DeleteServiceResult> => {
      setSubmitting(true);

      try {
        await deleteService(serviceId);
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiError) {
          return { ok: false, message: err.message, status: err.status };
        }
        return {
          ok: false,
          message:
            err instanceof Error ? err.message : 'Failed to delete service',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { remove, submitting };
}
