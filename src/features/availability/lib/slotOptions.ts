import { formatAppointmentDisplay, isoToNaiveUtc } from '../../../shared/lib';
import type { TimeSlot } from '../api';

/** UI option derived from an availability TimeSlot. */
export type SlotOption = {
  /** Original ISO from API (for display / refresh matching). */
  startsAtIso: string;
  endsAtIso: string;
  /** Naive UTC wall-clock for book/reschedule body (`YYYY-MM-DD HH:mm:ss`). */
  startsAtNaive: string;
  /** Short time label for pickers (UTC wall-clock HH:mm). */
  label: string;
  /** Longer display string if needed. */
  display: string;
};

function utcTimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

/** Map API `TimeSlot[]` → picker options keeping both ISO and naive forms. */
export function mapSlotsToOptions(slots: TimeSlot[]): SlotOption[] {
  return slots.map((slot) => ({
    startsAtIso: slot.starts_at,
    endsAtIso: slot.ends_at,
    startsAtNaive: isoToNaiveUtc(slot.starts_at),
    label: utcTimeLabel(slot.starts_at),
    display: formatAppointmentDisplay(slot.starts_at),
  }));
}

export function findSlotOption(
  options: SlotOption[],
  startsAtIso: string | null | undefined,
): SlotOption | null {
  if (!startsAtIso) return null;
  return options.find((opt) => opt.startsAtIso === startsAtIso) ?? null;
}
