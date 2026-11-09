import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import {
  createService,
  type Service,
  type ServiceWrite,
} from '../api';

export type CreateServiceResult =
  | { ok: true; service: Service }
  | {
      ok: false;
      message: string;
      status?: number;
      errors?: Record<string, string[]>;
    };

export function useCreateService() {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (body: ServiceWrite): Promise<CreateServiceResult> => {
      setSubmitting(true);

      try {
        const service = await createService(body);
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
            err instanceof Error ? err.message : 'Failed to create service',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { create, submitting };
}
