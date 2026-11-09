import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
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
            err instanceof Error
              ? err.message
              : 'Failed to reschedule appointment',
        };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { reschedule, submitting };
}
