import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
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
        const failure = toApiFailure(err, 'Failed to delete service');
        return {
          ok: false,
          message: failure.message,
          status: failure.status,
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { remove, submitting };
}
