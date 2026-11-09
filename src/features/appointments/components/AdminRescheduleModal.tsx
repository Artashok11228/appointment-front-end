import { useEffect, useState, type ReactElement } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';
import { useMessage } from '../../../Context/MessageContext';
import {
  formatAppointmentDisplay,
  isBookingOpenDayUtc,
} from '../../../shared/lib';
import SlotPicker from '../../availability/components/SlotPicker';
import { useServiceAvailability } from '../../availability/hooks';
import type { SlotOption } from '../../availability/lib/slotOptions';
import { useRescheduleAppointment } from '../hooks';
import type { Appointment } from '../api';

/** SlotPicker is JSX without prop types; cast for TS consumers. */
const TypedSlotPicker = SlotPicker as (props: {
  options?: SlotOption[];
  selectedIso?: string | null;
  onSelect?: (option: SlotOption) => void;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  enabled?: boolean;
  disabled?: boolean;
  className?: string;
}) => ReactElement;

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
};

function utcDateYmd(iso: string): string {
  const starts = new Date(iso);
  if (Number.isNaN(starts.getTime())) return '';
  return `${starts.getUTCFullYear()}-${String(starts.getUTCMonth() + 1).padStart(2, '0')}-${String(starts.getUTCDate()).padStart(2, '0')}`;
}

export function AdminRescheduleModal({
  appointment,
  onClose,
  onSuccess,
}: Props) {
  const { showMessage } = useMessage();
  const { reschedule, submitting } = useRescheduleAppointment();
  const [newDate, setNewDate] = useState(utcDateYmd(appointment.starts_at));
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const availability = useServiceAvailability(
    appointment.service_id,
    newDate || null,
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const submit = async () => {
    if (!newDate || !selectedSlot) {
      showMessage('error', 'Please select a date and available slot.');
      return;
    }
    if (!isBookingOpenDayUtc(newDate)) {
      showMessage('warning', 'Bookings are Mon–Fri only (UTC).');
      return;
    }

    const result = await reschedule(appointment.id, {
      starts_at: selectedSlot.startsAtNaive,
    });

    if (result.ok) {
      showMessage('success', 'Appointment rescheduled.');
      onSuccess();
      onClose();
      return;
    }

    const fieldMsg = result.errors?.starts_at?.[0];
    setSelectedSlot(null);
    setSlotError(fieldMsg || result.message);
    showMessage('error', result.message);
    if (result.status === 422) {
      await availability.refetch();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-obsidian-surface border border-[#333] w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#333]">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-champagne" />
              Reschedule
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            <p className="text-xs text-champagne-muted">
              Current:{' '}
              <span className="text-white">
                {formatAppointmentDisplay(appointment.starts_at)} UTC
              </span>
              . Service cannot be changed — only starts_at.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-2">
                Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setSelectedSlot(null);
                  setSlotError(null);
                }}
                className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-champagne focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-2">
                Available slots
              </label>
              <TypedSlotPicker
                options={availability.options}
                selectedIso={selectedSlot?.startsAtIso ?? null}
                onSelect={(option) => {
                  setSelectedSlot(option);
                  setSlotError(null);
                }}
                loading={availability.loading}
                error={availability.error}
                empty={availability.empty}
                enabled={availability.enabled}
                disabled={submitting}
              />
              {slotError && (
                <p className="mt-2 text-xs text-red-400" role="alert">
                  {slotError}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-[#333] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-300 border border-[#333] rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || !selectedSlot}
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2 text-sm font-bold text-black bg-champagne hover:bg-champagne-dark rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Check size={14} />
              {submitting ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          message="Reschedule this appointment to the selected slot?"
          onConfirm={async () => {
            setConfirmOpen(false);
            await submit();
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
