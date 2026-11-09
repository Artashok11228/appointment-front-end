/** App booking timezone is UTC (Laravel APP_TIMEZONE). Do not shift to browser local. */
export const APP_TIMEZONE = 'UTC';

/** Open hours: Mon–Fri 09:00–17:00 UTC (config/booking.php). */
export const BOOKING_OPEN_DAYS = [1, 2, 3, 4, 5] as const; // Monday=1 … Friday=5 (Date.getUTCDay)
export const BOOKING_OPEN_HOUR_UTC = 9;
export const BOOKING_CLOSE_HOUR_UTC = 17;
export const BOOKING_MODIFICATION_LOCK_MINUTES = 120;

/**
 * Convert an availability ISO instant to a naive UTC wall-clock string for book/reschedule bodies.
 * Example: "2026-11-10T09:45:00+00:00" → "2026-11-10 09:45:00"
 * Uses UTC getters so browser local timezone never changes the digits.
 */
export function isoToNaiveUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO datetime: ${iso}`);
  }

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/** Human-readable appointment time in UTC (matches server wall-clock). */
export function formatAppointmentDisplay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * True when a customer must not cancel/reschedule:
 * within `lockMinutes` before `starts_at` (or already past).
 */
export function isWithinModificationLock(
  startsAtIso: string,
  now: number = Date.now(),
  lockMinutes: number = BOOKING_MODIFICATION_LOCK_MINUTES,
): boolean {
  const startsAt = new Date(startsAtIso).getTime();
  if (Number.isNaN(startsAt)) {
    return true;
  }

  return startsAt - now <= lockMinutes * 60 * 1000;
}

/** Calendar day is a booking-open weekday in UTC (Mon–Fri). */
export function isBookingOpenDayUtc(dateYmd: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateYmd);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return (BOOKING_OPEN_DAYS as readonly number[]).includes(utcDay);
}
