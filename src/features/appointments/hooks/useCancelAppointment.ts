import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
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
        const failure = toApiFailure(err, 'Failed to cancel appointment');
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

  return { cancel, submitting };
}
