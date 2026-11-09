import { isWithinModificationLock } from '../../../shared/lib';
import type { Appointment } from '../api';

/** Customer may cancel/reschedule only when confirmed and outside the 120‑min lock. */
export function canModifyAppointment(
  appointment: Pick<Appointment, 'status' | 'starts_at'>,
  now: number = Date.now(),
): boolean {
  if (appointment.status !== 'confirmed') return false;
  return !isWithinModificationLock(appointment.starts_at, now);
}

export function modificationBlockReason(
  appointment: Pick<Appointment, 'status' | 'starts_at'>,
  now: number = Date.now(),
): string | null {
  if (appointment.status !== 'confirmed') {
    return 'Only a confirmed appointment can be changed.';
  }
  if (isWithinModificationLock(appointment.starts_at, now)) {
    return 'This appointment can no longer be changed (within 120 minutes of start).';
  }
  return null;
}
