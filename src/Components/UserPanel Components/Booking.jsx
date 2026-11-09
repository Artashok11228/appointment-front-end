import { useRef, useState } from 'react'
import AppointmentCards from './AppointmentCards.jsx'
import { useAppointments } from '../../features/appointments/hooks'

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
]

function Booking() {
    const appointmentSectionRef = useRef(null)
    const [status, setStatus] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [page, setPage] = useState(1)

    const { appointments, meta, loading, error, refetch } = useAppointments({
        status,
        from,
        to,
        page,
    })

    const handleFilterChange = (updater) => {
        updater()
        setPage(1)
    }

    return (
        <div ref={appointmentSectionRef} className="bg-obsidian-surface px-6 sm:px-8 pb-12 sm:pb-14 shadow-lg rounded-lg transition-all duration-500" id='appoinments'>
            <div className="head-background bg-obsidian-elevated w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] -mx-6 sm:-mx-8 -mt-8 px-6 sm:px-8 py-6 sm:py-8 mb-6 rounded-t-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-champagne mt-1"><span className="text-white">My</span> Appointments</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div>
                    <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => handleFilterChange(() => setStatus(e.target.value))}
                        className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => handleFilterChange(() => setFrom(e.target.value))}
                        className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => handleFilterChange(() => setTo(e.target.value))}
                        className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none"
                    />
                </div>
            </div>

            {loading && (
                <p className="text-champagne-muted text-sm py-8 text-center">Loading appointments…</p>
            )}

            {error && !loading && (
                <div className="bg-[#0F0F0F] border border-red-900/50 rounded-lg p-6 text-center">
                    <p className="text-red-400 text-sm mb-3" role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="text-xs uppercase tracking-wider text-champagne border border-champagne/40 px-4 py-2 hover:bg-champagne hover:text-black transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && appointments.length === 0 && (
                <div className="bg-[#0F0F0F] border border-[#333333] rounded-lg p-6 sm:p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15">
                        <svg className="h-7 w-7 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 7V3" />
                            <path d="M16 7V3" />
                            <path d="M3 11h18" />
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M7 15h5" />
                        </svg>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">No appointments found</h3>
                    <p className="text-champagne-muted text-sm">No appointments match your current filters.</p>
                </div>
            )}

            {!loading && !error && appointments.length > 0 && (
                <>
                    <p className="text-champagne-muted mb-8 px-1">
                        View your upcoming and past bookings
                        {meta ? ` (${meta.total} total)` : ''}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {appointments.map((appointment) => (
                            <AppointmentCards
                                key={appointment.id}
                                appointment={appointment}
                                onChanged={() => refetch()}
                            />
                        ))}
                    </div>

                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center justify-between text-sm text-champagne-muted">
                            <span>
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="px-3 py-1 border border-[#333] rounded hover:border-champagne disabled:opacity-40 cursor-pointer"
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    disabled={page >= meta.last_page}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 border border-[#333] rounded hover:border-champagne disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Booking
