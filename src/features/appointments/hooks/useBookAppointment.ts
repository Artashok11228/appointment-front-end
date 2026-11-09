import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
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
            err instanceof Error ? err.message : 'Failed to book appointment',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { book, submitting };
}
