import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { cancelAppointment, type Appointment } from '../api';

export type CancelResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; message: string; status?: number };

export function useCancelAppointment() {
  const [submitting, setSubmitting] = useState(false);

  const cancel = useCallback(
    async (appointmentId: number): Promise<CancelResult> => {
      setSubmitting(true);

      try {
        const appointment = await cancelAppointment(appointmentId);
        return { ok: true, appointment };
      } catch (err) {
        if (err instanceof ApiError) {
          return { ok: false, message: err.message, status: err.status };
        }
        return {
          ok: false,
          message:
            err instanceof Error
              ? err.message
              : 'Failed to cancel appointment',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { cancel, submitting };
}
