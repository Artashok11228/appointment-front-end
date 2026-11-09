import { Calendar, Clock, Scissors, X, Check } from 'lucide-react'
import { useMessage } from '../../Context/MessageContext.jsx'
import { useState, useEffect } from 'react'
import ConfirmModal from '../ConfirmModal'
import { formatServicePrice } from '../../features/services/lib/formatServicePrice'
import { useServiceAvailability } from '../../features/availability/hooks'
import SlotPicker from '../../features/availability/components/SlotPicker'
import {
  useCancelAppointment,
  useRescheduleAppointment,
} from '../../features/appointments/hooks'
import {
  canModifyAppointment,
  modificationBlockReason,
} from '../../features/appointments/lib/canModifyAppointment'
import {
  acceptBookingOpenDateInput,
  BOOKING_WEEKDAY_MESSAGE,
  formatAppointmentDisplay,
  isBookingOpenDayUtc,
} from '../../shared/lib'

function statusStyle(status) {
    switch (status) {
        case 'confirmed':
            return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
        case 'cancelled':
            return 'bg-red-950/30 text-red-400 border-red-900/50'
        case 'completed':
            return 'bg-zinc-900 text-zinc-400 border-zinc-800'
        default:
            return 'bg-zinc-900 text-zinc-400 border-zinc-800'
    }
}

function AppointmentCards({ appointment, onChanged }) {
    const { showMessage } = useMessage()
    const { cancel, submitting: cancelling } = useCancelAppointment()
    const { reschedule, submitting: rescheduling } = useRescheduleAppointment()

    const [isRescheduling, setIsRescheduling] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [slotError, setSlotError] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null)

    const ANIM_DURATION = 300
    const canModify = canModifyAppointment(appointment)
    const blockReason = modificationBlockReason(appointment)
    const serviceName = appointment.service?.name ?? `Service #${appointment.service_id}`
    const priceLabel = appointment.service
        ? formatServicePrice(appointment.service.price)
        : '—'
    const displayWhen = formatAppointmentDisplay(appointment.starts_at)

    const availability = useServiceAvailability(
        isRescheduling ? appointment.service_id : null,
        isRescheduling && newDate ? newDate : null,
    )

    useEffect(() => {
        let t
        if (!isRescheduling && isVisible) {
            t = setTimeout(() => setIsVisible(false), ANIM_DURATION)
        }
        return () => {
            if (t) clearTimeout(t)
        }
    }, [isRescheduling, isVisible])

    const openReschedule = () => {
        const starts = new Date(appointment.starts_at)
        const ymd = Number.isNaN(starts.getTime())
            ? ''
            : `${starts.getUTCFullYear()}-${String(starts.getUTCMonth() + 1).padStart(2, '0')}-${String(starts.getUTCDate()).padStart(2, '0')}`
        setNewDate(ymd)
        setSelectedSlot(null)
        setSlotError(null)
        setIsVisible(true)
        requestAnimationFrame(() => setIsRescheduling(true))
    }

    const handleCancel = () => {
        setConfirmAction({
            message: 'Are you sure you want to cancel this appointment?',
            onConfirm: async () => {
                const result = await cancel(appointment.id)
                if (result.ok) {
                    showMessage('success', 'Appointment cancelled successfully')
                    onChanged?.(result.appointment)
                } else {
                    showMessage('error', result.message)
                }
                setConfirmAction(null)
            },
            onCancel: () => setConfirmAction(null),
        })
    }

    const handleRescheduleSubmit = async () => {
        if (!newDate || !selectedSlot) {
            showMessage('error', 'Please select a date and available slot.')
            return
        }
        if (!isBookingOpenDayUtc(newDate)) {
            showMessage('warning', BOOKING_WEEKDAY_MESSAGE)
            return
        }

        const result = await reschedule(appointment.id, {
            starts_at: selectedSlot.startsAtNaive,
        })

        if (result.ok) {
            showMessage('success', 'Appointment rescheduled successfully')
            setIsRescheduling(false)
            onChanged?.(result.appointment)
            return
        }

        const fieldMsg = result.errors?.starts_at?.[0]
        setSelectedSlot(null)
        setSlotError(fieldMsg || result.message)
        showMessage('error', result.message)
        if (result.status === 422) {
            await availability.refetch()
        }
    }

    return (
        <div className={`group relative bg-obsidian-surface border border-[#222] rounded-2xl p-6 transition-all duration-300 shadow-md shadow-black/20 overflow-hidden ${isRescheduling ? 'min-h-105 md:min-h-90' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg tracking-wide mb-1">
                        {serviceName}
                    </h3>
                    <p className="text-xs text-champagne-muted">{displayWhen} UTC</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${statusStyle(appointment.status)}`}>
                    {appointment.status}
                </span>
            </div>

            {confirmAction && (
                <ConfirmModal
                    message={confirmAction.message}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={confirmAction.onCancel}
                />
            )}

            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian border border-[#222]">
                        <div className="w-8 h-8 rounded-full bg-obsidian-elevated border border-[#333] flex items-center justify-center text-champagne">
                            <Calendar size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#555] font-bold uppercase tracking-wider">Starts</p>
                            <p className="text-sm font-semibold text-gray-200">{displayWhen}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian border border-[#222]">
                        <div className="w-8 h-8 rounded-full bg-obsidian-elevated border border-[#333] flex items-center justify-center text-champagne">
                            <Clock size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#555] font-bold uppercase tracking-wider">Ends</p>
                            <p className="text-sm font-semibold text-gray-200">
                                {formatAppointmentDisplay(appointment.ends_at)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-obsidian border border-[#222]">
                    <div className="flex items-center gap-2 mb-2 text-champagne">
                        <Scissors size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777]">Service</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-obsidian-elevated border border-[#333] text-gray-200 text-xs font-semibold px-2 py-1 rounded-lg">
                            <span className="text-champagne">{serviceName}</span>
                            <span className="text-[#777]">{priceLabel}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-obsidian border border-[#222]">
                    <span className="text-[10px] text-[#777] font-bold uppercase tracking-wider">Price</span>
                    <span className="text-sm font-extrabold text-champagne">{priceLabel}</span>
                </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${isRescheduling ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
                <button
                    type="button"
                    onClick={openReschedule}
                    disabled={!canModify || cancelling}
                    title={blockReason || undefined}
                    className="flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 text-white hover:bg-champagne hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    Reschedule
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!canModify || cancelling}
                    title={blockReason || undefined}
                    className="flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 text-[#777] hover:border-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    Cancel
                </button>
            </div>

            {!canModify && blockReason && !isRescheduling && (
                <p className="mt-3 text-[11px] text-[#777]">{blockReason}</p>
            )}

            <div
                className={`absolute inset-0 bg-obsidian-surface p-6 transition-transform duration-300 ease-in-out space-y-4 ${isRescheduling ? 'translate-y-0' : 'translate-y-full'} overflow-y-auto`}
            >
                <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} className="text-champagne" />
                        New time (same service)
                    </h4>
                    <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-[#777] hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-2">Select Date</label>
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => {
                            const accepted = acceptBookingOpenDateInput(e.target.value)
                            if (!accepted.ok) {
                                showMessage('warning', accepted.reason)
                                return
                            }
                            setNewDate(accepted.value)
                            setSelectedSlot(null)
                            setSlotError(null)
                        }}
                        className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-champagne focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-2">Available slots</label>
                    <SlotPicker
                        options={availability.options}
                        selectedIso={selectedSlot?.startsAtIso ?? null}
                        onSelect={(option) => {
                            setSelectedSlot(option)
                            setSlotError(null)
                        }}
                        loading={availability.loading}
                        error={availability.error}
                        empty={availability.empty}
                        enabled={availability.enabled}
                        disabled={rescheduling}
                    />
                    {slotError && (
                        <p className="mt-2 text-xs text-red-400" role="alert">{slotError}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleRescheduleSubmit}
                    disabled={rescheduling}
                    className="w-full py-3 bg-champagne text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-champagne-dark transition-colors shadow-lg shadow-champagne/20 mt-2 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    <Check size={14} />
                    {rescheduling ? 'Saving…' : 'Confirm Change'}
                </button>
            </div>
        </div>
    )
}

export default AppointmentCards
