import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
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
      bindFields?: boolean;
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
        const failure = toApiFailure(err, 'Failed to create service');
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

  return { create, submitting };
}
