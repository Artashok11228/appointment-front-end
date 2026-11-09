import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import {
  updateService,
  type Service,
  type ServiceWrite,
} from '../api';

export type UpdateServiceResult =
  | { ok: true; service: Service }
  | {
      ok: false;
      message: string;
      status?: number;
      errors?: Record<string, string[]>;
    };

export function useUpdateService() {
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(
    async (
      serviceId: number,
      body: ServiceWrite,
    ): Promise<UpdateServiceResult> => {
      setSubmitting(true);

      try {
        const service = await updateService(serviceId, body);
        return { ok: true, service };
      } catch (err) {
        if (err instanceof ApiError) {
          return {
            ok: false,
            message: err.message,
            status: err.status,
            errors: err.errors,
          };
        }
        return {
          ok: false,
          message:
            err instanceof Error ? err.message : 'Failed to update service',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { update, submitting };
}
