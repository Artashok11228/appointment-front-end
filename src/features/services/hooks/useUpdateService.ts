import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
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
      bindFields?: boolean;
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
        const failure = toApiFailure(err, 'Failed to update service');
        return {
          ok: false,
          message: failure.message,
          status: failure.status,
          errors: failure.errors,
          bindFields: failure.bindFields,
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { update, submitting };
}
