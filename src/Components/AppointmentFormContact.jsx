import { useState, useRef, useEffect } from 'react'
import { useMessage } from '../Context/MessageContext.jsx'
import { useAppointment } from '../Context/AppointmentContext.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { useServices } from '../features/services/hooks'
import {
  formatServicePrice,
  parseServicePrice,
} from '../features/services/lib/formatServicePrice'
import { useServiceAvailability } from '../features/availability/hooks'
import SlotPicker from '../features/availability/components/SlotPicker'

function AppointmentFormContact() {
    const { currentUser } = useAuth()
    const { services, loading: servicesLoading, error: servicesError } = useServices()

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const [selectedService, setSelectedService] = useState([])
    const [name, setName] = useState(currentUser ? currentUser.name : '')
    const [email, setEmail] = useState(currentUser ? currentUser.email : '')
    const [phoneNumber, setPhoneNumber] = useState(currentUser ? currentUser.phone : '')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [message, setMessage] = useState('')

    const availabilityServiceId = selectedService[0]?.id ?? null
    const availability = useServiceAvailability(availabilityServiceId, date || null)

    const totalPrice = selectedService.reduce((sum, s) => sum + parseServicePrice(s.price), 0)

    const { showMessage } = useMessage()
    const { bookAppointment } = useAppointment()

    const toggleService = (service) => {
        setSelectedService(prev => {
            const exists = prev.find(s => s.id === service.id)
            if (exists) return prev.filter(s => s.id !== service.id)
            return [...prev, { id: service.id, name: service.name, price: service.price }]
        })
        setSelectedSlot(null)
        setTime('')
    }

    const handleDateChange = (nextDate) => {
        setDate(nextDate)
        setSelectedSlot(null)
        setTime('')
    }

    const handleSelectSlot = (option) => {
        setSelectedSlot(option)
        setTime(option.label)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (selectedService.length === 0) {
            showMessage('error', 'Please select a service before submitting the form.')
            return
        }
        if (name === '' || email === '' || phoneNumber === '' || date === '' || !selectedSlot) {
            showMessage('error', 'Please fill in all required fields and pick a slot.')
            return
        }
        if (date < new Date().toISOString().split('T')[0]) {
            showMessage('error', 'Please select a Correct date.')
            return
        }
        const phonePattern = /^(03\d{2}-\d{7}|\+923\d{9})$/
        if (!phonePattern.test(phoneNumber)) {
            showMessage('error', 'Please enter a valid Pakistani phone number (e.g., 0336-3090793 or +9233363090793).')
            return
        }

        const formData = {
            name,
            email,
            phoneNumber,
            selectedService: selectedService.map(s => ({
                id: s.id,
                name: s.name,
                price: formatServicePrice(s.price),
            })),
            date,
            time,
            startsAtNaive: selectedSlot.startsAtNaive,
            startsAtIso: selectedSlot.startsAtIso,
            message,
            totalPrice
        }

        // Local persist until Phase 4 API booking.
        const result = await bookAppointment(formData)
        if (result && result.success) {
            const assignmentSummary = result.assignments
                .map(a => `${a.service} → ${a.stylist}`)
                .join(', ')
            showMessage('success', `Booking confirmed! ${assignmentSummary}`)
            setName('')
            setEmail('')
            setPhoneNumber('')
            setSelectedService([])
            setDate('')
            setTime('')
            setSelectedSlot(null)
            setMessage('')
        } else {
            showMessage('error', result?.error || 'An error occurred while booking your appointment. Please try again later.')
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
        <form onSubmit={handleSubmit} className="w-full space-y-4 mt-1">
            <div>
                <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="name">Full Name *</label>
                <input type="text" placeholder="Hassan Waheed Ali" id='name' value={name} onChange={(e) => setName(e.target.value)} className="w-full font-bold border-3  rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne mt-1.5" required />
            </div>
            <div>
                <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="email">Email Address *</label>
                <input type="email" placeholder="hassanwaheedalis@gmail.com" id='email' value={email} onChange={(e) => setEmail(e.target.value)} className="w-full font-bold border-3 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne mt-1.5" required />
            </div>
            <div>
                <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="phone">Phone Number *</label>
                <input type="tel" placeholder="0336-3090793" id='phone' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full font-bold border-3 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-champagne-muted tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne mt-1.5" required />
            </div>
            <div className="service-select w-full relative" ref={dropdownRef}>
                <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="service">Select Service *</label>
                <div className="relative mt-1.5">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full font-bold border-3 rounded-md p-2 px-3 md:px-4 py-2 md:py-3 text-sm tracking-tight bg-obsidian text-left flex justify-between items-center transition-colors ${isOpen ? 'border-champagne text-champagne' : 'border-[#454545] text-[#77777786] hover:border-champagne'
                            }`}
                    >
                        <span>
                            {selectedService.length === 0
                                ? 'SELECT SERVICES'
                                : `${selectedService.length} SERVICE${selectedService.length > 1 ? 'S' : ''} SELECTED`}
                        </span>
                        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 w-full bg-[#1b1b1b] rounded-md border-2 border-[#454545] z-50 max-h-60 md:max-h-70 overflow-y-auto">
                            {servicesLoading && (
                                <div className="px-3 py-3 text-xs text-champagne-muted">Loading services…</div>
                            )}
                            {servicesError && (
                                <div className="px-3 py-3 text-xs text-red-400" role="alert">{servicesError}</div>
                            )}
                            {!servicesLoading && !servicesError && services.length === 0 && (
                                <div className="px-3 py-3 text-xs text-champagne-muted">No services available.</div>
                            )}
                            {services.map((service) => {
                                const isSelected = selectedService.some(s => s.id === service.id)
                                const priceLabel = formatServicePrice(service.price)
                                return (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => toggleService(service)}
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

                {selectedService.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedService.map(s => (
                            <span
                                key={s.id}
                                className="inline-flex items-center gap-1.5 bg-champagne/15 border border-champagne/40 text-champagne text-xs font-black px-2 py-1 rounded-sm tracking-tight mt-1.5"
                            >
                                {s.name} — {formatServicePrice(s.price)}
                                <button
                                    type="button"
                                    onClick={() => toggleService(s)}
                                    className="text-champagne hover:text-white transition-colors leading-none"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {selectedService.length > 0 && (
                    <div className="mt-2.5 text-left text-xs font-black text-champagne-muted tracking-wide">
                        TOTAL: <span className="text-champagne">{formatServicePrice(totalPrice)}</span>
                    </div>
                )}
            </div>
            <div className="date-time-section flex flex-col gap-3 md:gap-4">
                <div className="flex-1">
                    <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="date">Date *</label>
                    <input type="date" placeholder="DATE" id='date' value={date} onChange={(e) => handleDateChange(e.target.value)} className="w-full font-bold border-3 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-[#77777786] tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne mt-1.5" required />
                </div>
                <div className="flex-1">
                    <label className="font-medium leading-none text-sm text-champagne-muted ml-0.5">Time slot *</label>
                    <div className="mt-1.5">
                        <SlotPicker
                            options={availability.options}
                            selectedIso={selectedSlot?.startsAtIso ?? null}
                            onSelect={handleSelectSlot}
                            loading={availability.loading}
                            error={availability.error}
                            empty={availability.empty}
                            enabled={availability.enabled}
                        />
                    </div>
                </div>
            </div>
            <div className="message-area">
                <label className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-champagne-muted ml-0.5" htmlFor="message">Message</label>
                <textarea placeholder="Please Write Your Message" id='message' value={message} onChange={(e) => setMessage(e.target.value)} className="w-full font-semibold border-3 rounded-md border-[#454545] px-2 md:px-3 py-2 md:py-3 text-sm text-[#b5b3b3] tracking-tight bg-obsidian hover:border-champagne transition-colors focus:outline-none focus:border-champagne mt-1.5 h-24" rows={1} />
            </div>
            <div className='pt-3'>
                <button type="submit" className="w-full border-2 border-champagne/50 hover:border-champagne text-champagne font-black p-3 px-6 hover:bg-champagne hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-widest">Book An Appointment</button>
            </div>
        </form >
    )
}

export default AppointmentFormContact
