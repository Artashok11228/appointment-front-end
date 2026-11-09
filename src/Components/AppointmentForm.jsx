import { useState, useRef, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext.jsx'
import { useMessage } from '../Context/MessageContext.jsx'
import { useServices } from '../features/services/hooks'
import { formatServicePrice } from '../features/services/lib/formatServicePrice'
import { useServiceAvailability } from '../features/availability/hooks'
import SlotPicker from '../features/availability/components/SlotPicker'
import { useBookAppointment } from '../features/appointments/hooks'
import { isBookingOpenDayUtc } from '../shared/lib'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Step1Selection = memo(({
    services,
    servicesLoading,
    servicesError,
    selectedService,
    onSelectService,
    isOpen,
    setIsOpen,
    dropdownRef,
    onNext,
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="w-full relative" ref={dropdownRef}>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full font-black border-2 md:border-5 p-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base tracking-tight bg-obsidian text-left flex justify-between items-center transition-colors ${isOpen ? 'border-champagne text-champagne' : 'border-[#454545] text-champagne-muted hover:border-champagne'
                            }`}
                    >
                        <span>
                            {selectedService
                                ? selectedService.name
                                : 'SELECT A SERVICE'}
                        </span>
                        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 w-full bg-[#1b1b1b] border-2 md:border-5 border-champagne z-50 mt-1 max-h-60 md:max-h-70 overflow-y-auto">
                            {servicesLoading && (
                                <div className="px-3 md:px-4 py-3 text-xs text-champagne-muted">Loading services…</div>
                            )}
                            {servicesError && (
                                <div className="px-3 md:px-4 py-3 text-xs text-red-400" role="alert">{servicesError}</div>
                            )}
                            {!servicesLoading && !servicesError && services.length === 0 && (
                                <div className="px-3 md:px-4 py-3 text-xs text-champagne-muted">No services available.</div>
                            )}
                            {services.map((service) => {
                                const isSelected = selectedService?.id === service.id
                                const priceLabel = formatServicePrice(service.price)
                                return (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => {
                                            onSelectService(service)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full text-left px-3 md:px-4 py-2 md:py-3 transition-colors font-black tracking-tight text-xs md:text-sm flex items-center justify-between gap-2 ${isSelected
                                            ? 'bg-champagne/10 text-champagne'
                                            : 'text-[#bfbdbd] hover:bg-champagne/5 hover:text-white'
                                            }`}
                                    >
                                        <span>{service.name} — {priceLabel}</span>
                                        <span className={`shrink-0 w-4 h-4 border-2 rounded-sm flex items-center justify-center text-[10px] transition-colors ${isSelected ? 'border-champagne bg-champagne text-black' : 'border-[#555]'
                                            }`}>
                                            {isSelected && '✓'}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {selectedService && (
                    <div className="mt-3 text-left text-sm font-black text-champagne-muted tracking-wide">
                        Price: <span className="text-champagne text-lg">{formatServicePrice(selectedService.price)}</span>
                        <span className="ml-3 text-xs text-[#777]">
                            {selectedService.duration_minutes} min
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full mt-2">
                <button
                    type="button"
                    onClick={onNext}
                    className="w-full border-2 border-champagne/50 hover:border-champagne text-champagne font-black p-3 px-6 hover:bg-champagne hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest"
                >
                    Continue to Schedule
                </button>
            </div>
        </div>
    )
})

const Step2Schedule = memo(({
    date, setDate,
    selectedSlotIso, onSelectSlot,
    availability,
    startsAtError,
    submitting,
    onPrev, onSubmit,
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="w-full relative group">
                <label className="absolute -top-3 left-3 bg-obsidian text-champagne px-1 text-[10px] font-bold uppercase tracking-widest z-10 transition-colors group-hover:text-white">Select Date (Mon–Fri UTC)</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full font-black border-2 md:border-5 border-[#454545] p-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base text-champagne-muted tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne"
                    required
                />
            </div>

            <div className="w-full">
                <p className="text-[10px] font-bold uppercase tracking-widest text-champagne mb-2">
                    Available slots (UTC)
                </p>
                <SlotPicker
                    options={availability.options}
                    selectedIso={selectedSlotIso}
                    onSelect={onSelectSlot}
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

            <div className="flex gap-4 mt-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={submitting}
                    className="w-1/3 border-2 border-[#454545] hover:border-white text-white/50 hover:text-white font-black p-3 transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-2/3 border-5 border-champagne text-white font-black p-3 hover:bg-[#d28127] hover:border-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-sm disabled:opacity-50"
                >
                    {submitting ? 'Booking…' : 'Confirm Booking'}
                </button>
            </div>
        </div>
    )
})

function AppointmentAuthGate() {
    const { isAuthenticated, loading: authLoading } = useAuth()

    if (authLoading) {
        return <p className="text-sm text-champagne-muted">Checking session…</p>
    }

    if (!isAuthenticated) {
        return (
            <div className="border-2 border-[#454545] p-6 text-center space-y-3">
                <p className="text-champagne font-black tracking-wide uppercase text-sm">
                    Sign in required to book
                </p>
                <p className="text-champagne-muted text-xs">
                    Appointments are booked for your account. Guests cannot book.
                </p>
                <Link
                    to="/login"
                    className="inline-block border-2 border-champagne/50 hover:border-champagne text-champagne font-black px-6 py-3 uppercase tracking-widest text-xs transition-colors"
                >
                    Go to Login
                </Link>
            </div>
        )
    }

    return <AppointmentBookForm />
}

function AppointmentBookForm() {
    const { currentUser } = useAuth()
    const { showMessage } = useMessage()
    const { services, loading: servicesLoading, error: servicesError } = useServices()
    const { book, submitting } = useBookAppointment()

    const [currentStep, setCurrentStep] = useState(1)
    const containerRef = useRef(null)

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const [selectedService, setSelectedService] = useState(null)
    const [date, setDate] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [startsAtError, setStartsAtError] = useState(null)

    const availability = useServiceAvailability(selectedService?.id ?? null, date || null)

    useGSAP(() => {
        const steps = gsap.utils.toArray('.form-step')
        const easeLuxury = "cubic-bezier(0.23, 1, 0.32, 1)"

        steps.forEach((step, index) => {
            const stepNum = index + 1
            if (stepNum === currentStep) {
                gsap.fromTo(step,
                    { autoAlpha: 0, x: 30 },
                    { autoAlpha: 1, x: 0, duration: 0.8, ease: easeLuxury, force3D: true, display: 'block' }
                )
            } else if (stepNum < currentStep) {
                gsap.to(step, { autoAlpha: 0, x: -30, duration: 0.6, ease: easeLuxury, force3D: true, display: 'none' })
            } else {
                gsap.set(step, { autoAlpha: 0, x: 30, display: 'none' })
            }
        })
    }, { dependencies: [currentStep], scope: containerRef })

    const handleSelectService = (service) => {
        setSelectedService(service)
        setSelectedSlot(null)
        setStartsAtError(null)
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

    const handleNextStep1 = () => {
        if (!selectedService) {
            showMessage('warning', 'Please select one service to continue.')
            return
        }
        setCurrentStep(2)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedService || !selectedSlot) {
            showMessage('warning', 'Please choose a valid date and available slot.')
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
            setCurrentStep(1)
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
        <div className="w-full relative" ref={containerRef}>
            <p className="text-xs text-champagne-muted mb-4">
                Booking as <span className="text-champagne font-bold">{currentUser?.name}</span>
            </p>

            <div className="flex items-center gap-2 mb-8">
                {[1, 2].map((num) => (
                    <div key={num} className="flex-1 flex flex-col gap-2">
                        <div className={`h-1 w-full transition-colors duration-500 rounded-full ${num <= currentStep ? 'bg-champagne' : 'bg-white/10'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${num <= currentStep ? 'text-champagne' : 'text-white/30'}`}>
                            Step {num}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="relative">
                <div className="form-step hidden w-full">
                    <Step1Selection
                        services={services}
                        servicesLoading={servicesLoading}
                        servicesError={servicesError}
                        selectedService={selectedService}
                        onSelectService={handleSelectService}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        dropdownRef={dropdownRef}
                        onNext={handleNextStep1}
                    />
                </div>

                <div className="form-step hidden w-full">
                    <Step2Schedule
                        date={date}
                        setDate={handleDateChange}
                        selectedSlotIso={selectedSlot?.startsAtIso ?? null}
                        onSelectSlot={handleSelectSlot}
                        availability={availability}
                        startsAtError={startsAtError}
                        submitting={submitting}
                        onPrev={() => setCurrentStep(1)}
                        onSubmit={handleSubmit}
                    />
                </div>
            </form>
        </div>
    )
}

export default AppointmentAuthGate
