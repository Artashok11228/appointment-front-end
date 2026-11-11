import { useCallback, useState } from 'react';
import { toApiFailure } from '../../../shared/api';
import {
  rescheduleAppointment,
  type Appointment,
  type RescheduleAppointmentRequest,
} from '../api';

export type RescheduleResult =
  | { ok: true; appointment: Appointment }
  | {
      ok: false;
      message: string;
      status?: number;
      errors?: Record<string, string[]>;
      bindFields?: boolean;
    };

export function useRescheduleAppointment() {
  const [submitting, setSubmitting] = useState(false);

  const reschedule = useCallback(
    async (
      appointmentId: number,
      body: RescheduleAppointmentRequest,
    ): Promise<RescheduleResult> => {
      setSubmitting(true);

      try {
        const appointment = await rescheduleAppointment(appointmentId, body);
        return { ok: true, appointment };
      } catch (err) {
        const failure = toApiFailure(err, 'Failed to reschedule appointment');
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

  return { reschedule, submitting };
}
