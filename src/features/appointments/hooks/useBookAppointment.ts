import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
import {
  createAppointment,
  type Appointment,
  type StoreAppointmentRequest,
} from '../api';

export type BookResult =
  | { ok: true; appointment: Appointment }
  | {
      ok: false;
      message: string;
      status?: number;
      errors?: Record<string, string[]>;
      bindFields?: boolean;
    };

export function useBookAppointment() {
  const [submitting, setSubmitting] = useState(false);

  const book = useCallback(
    async (body: StoreAppointmentRequest): Promise<BookResult> => {
      setSubmitting(true);

      try {
        const appointment = await createAppointment(body);
        return { ok: true, appointment };
      } catch (err) {
        const failure = toApiFailure(err, 'Failed to book appointment');
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

  return { book, submitting };
}
