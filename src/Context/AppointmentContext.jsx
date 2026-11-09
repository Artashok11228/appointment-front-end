/* eslint-disable react-refresh/only-export-components */
/**
 * Thin stub until Phase 6 (admin appointments) and Phase 8 (delete dead staff UI).
 * Customer booking uses features/appointments hooks — not this context.
 * localStorage "Appointments" is no longer used.
 */
import { createContext, useContext, useEffect } from 'react'

const AppointmentContext = createContext(null)

const LEGACY_APPOINTMENTS_KEY = 'Appointments'

const stubResult = async (action) => ({
  success: false,
  error: `${action} moved to API (Phase 4). Admin UI lands in Phase 6.`,
})

export function AppointmentProvider({ children }) {
  useEffect(() => {
    localStorage.removeItem(LEGACY_APPOINTMENTS_KEY)
  }, [])

  const value = {
    appointments: [],
    bookAppointment: () => stubResult('bookAppointment'),
    displayAppointmentsByUser: async () => ({
      success: false,
      error: 'Use features/appointments hooks',
      data: [],
    }),
    cancelAppointment: () => stubResult('cancelAppointment'),
    rescheduleAppointment: () => stubResult('rescheduleAppointment'),
    updateAppointment: () => stubResult('updateAppointment'),
    updateAppointmentStatus: () => stubResult('updateAppointmentStatus'),
    deleteAppointment: () => stubResult('deleteAppointment'),
    getAppointmentsForStaff: () => [],
  }

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  )
}

export function useAppointment() {
  const ctx = useContext(AppointmentContext)
  if (!ctx) {
    throw new Error('useAppointment must be used within AppointmentProvider')
  }
  return ctx
}
