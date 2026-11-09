import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMessage } from '../Context/MessageContext.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { useServices } from '../features/services/hooks'
import { formatServicePrice } from '../features/services/lib/formatServicePrice'
import { useServiceAvailability } from '../features/availability/hooks'
import SlotPicker from '../features/availability/components/SlotPicker'
import { useBookAppointment } from '../features/appointments/hooks'
import { isBookingOpenDayUtc } from '../shared/lib'

function AppointmentFormContact() {
    const { isAuthenticated, loading: authLoading } = useAuth()

    if (authLoading) {
        return <p className="text-sm text-champagne-muted">Checking session…</p>
    }

    if (!isAuthenticated) {
        return (
            <div className="border border-[#333] rounded-lg p-6 text-center space-y-3 bg-[#0F0F0F]">
                <p className="text-champagne font-semibold">Sign in required to book</p>
                <p className="text-champagne-muted text-sm">
                    Appointments are booked for your account.
                </p>
                <Link
                    to="/login"
                    className="inline-block px-5 py-2 border border-champagne text-champagne text-sm font-bold uppercase tracking-wider hover:bg-champagne hover:text-black transition-colors"
                >
                    Go to Login
                </Link>
            </div>
        )
    }

    return <ContactBookForm />
}

function ContactBookForm() {
    const { currentUser } = useAuth()
    const { services, loading: servicesLoading, error: servicesError } = useServices()
    const { book, submitting } = useBookAppointment()
    const { showMessage } = useMessage()

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const [selectedService, setSelectedService] = useState(null)
    const [date, setDate] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [startsAtError, setStartsAtError] = useState(null)

    const availability = useServiceAvailability(selectedService?.id ?? null, date || null)

    const handleSelectService = (service) => {
        setSelectedService(service)
        setSelectedSlot(null)
        setStartsAtError(null)
        setIsOpen(false)
    }

    const handleDateChange = (nextDate) => {
        setDate(nextDate)
        setSelectedSlot(null)
        setStartsAtError(null)
    }

    const handleSelectSlot = (option) => {
        setSelectedSlot(option)
        setStartsAtError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedService) {
            showMessage('error', 'Please select a service before submitting.')
            return
        }
        if (!date || !selectedSlot) {
            showMessage('error', 'Please pick a date and available slot.')
            return
        }
        if (date < new Date().toISOString().split('T')[0]) {
            showMessage('error', 'Please select a correct upcoming date.')
            return
        }
        if (!isBookingOpenDayUtc(date)) {
            showMessage('warning', 'Bookings are Mon–Fri only (UTC). Pick a weekday.')
            return
        }

        const result = await book({
            service_id: selectedService.id,
            starts_at: selectedSlot.startsAtNaive,
        })

        if (result.ok) {
            showMessage('success', `Booking confirmed for ${selectedService.name}.`)
            setSelectedService(null)
            setDate('')
            setSelectedSlot(null)
            setStartsAtError(null)
            return
        }

        const fieldMsg = result.errors?.starts_at?.[0]
        setSelectedSlot(null)
        setStartsAtError(fieldMsg || result.message)
        showMessage('error', result.message)
        if (result.status === 422) {
            await availability.refetch()
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-champagne-muted">
                Booking as <span className="text-champagne font-bold">{currentUser?.name}</span>
            </p>

            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full font-semibold border border-[#454545] p-3 text-left flex justify-between items-center transition-colors ${isOpen ? 'border-champagne text-champagne' : 'text-champagne-muted hover:border-champagne'
                        }`}
                >
                    <span>{selectedService ? selectedService.name : 'Select a service'}</span>
                    <span>▼</span>
                </button>
                {isOpen && (
                    <div className="absolute top-full left-0 w-full bg-[#1b1b1b] border border-champagne z-50 mt-1 max-h-56 overflow-y-auto">
                        {servicesLoading && (
                            <div className="px-3 py-2 text-xs text-champagne-muted">Loading…</div>
                        )}
                        {servicesError && (
                            <div className="px-3 py-2 text-xs text-red-400">{servicesError}</div>
                        )}
                        {services.map((service) => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => handleSelectService(service)}
                                className={`w-full text-left px-3 py-2 text-sm ${selectedService?.id === service.id
                                    ? 'bg-champagne/10 text-champagne'
                                    : 'text-gray-300 hover:bg-champagne/5'
                                    }`}
                            >
                                {service.name} — {formatServicePrice(service.price)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedService && (
                <p className="text-sm text-champagne">
                    {formatServicePrice(selectedService.price)}
                    <span className="text-champagne-muted text-xs ml-2">
                        {selectedService.duration_minutes} min
                    </span>
                </p>
            )}

            <div>
                <label className="block text-[10px] font-bold text-champagne uppercase tracking-wider mb-2">
                    Date (Mon–Fri UTC)
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-obsidian border border-[#454545] p-3 text-sm text-champagne-muted focus:border-champagne focus:outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold text-champagne uppercase tracking-wider mb-2">
                    Available slots (UTC)
                </label>
                <SlotPicker
                    options={availability.options}
                    selectedIso={selectedSlot?.startsAtIso ?? null}
                    onSelect={handleSelectSlot}
                    loading={availability.loading}
                    error={availability.error}
                    empty={availability.empty}
                    enabled={availability.enabled}
                    disabled={submitting}
                />
                {startsAtError && (
                    <p className="mt-2 text-xs text-red-400" role="alert">{startsAtError}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full border-2 border-champagne text-champagne font-black py-3 uppercase tracking-widest text-sm hover:bg-champagne hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
            >
                {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
        </form>
    )
}

export default AppointmentFormContact
