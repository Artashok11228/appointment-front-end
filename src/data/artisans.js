/**
 * Marketing-only artisan profiles for the landing page.
 * Not tied to auth, booking, or any API — there is no staff role in OpenAPI.
 */
import defaultAvatarImg from '../assets/BARBER.webp'
import defaultAvatarImg2 from '../assets/accountbarber.webp'
import MikeRoss from '../assets/MikeRoss.webp'
import OsmanAhmed from '../assets/osmanAhmed.webp'

export const artisans = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Senior Stylist',
    specialties: ['Haircut', 'Hair Color', 'Beard Trim'],
    experience: '5 years',
    avatar: defaultAvatarImg,
    schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '15:00' },
      wednesday: { start: '09:00', end: '15:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '08:00', end: '16:00' },
      sunday: null,
    },
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Color Specialist',
    specialties: ['Hair Color', 'Highlights', 'Balayage'],
    experience: '7 years',
    avatar: defaultAvatarImg2,
    schedule: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
      saturday: { start: '09:00', end: '17:00' },
      sunday: null,
    },
  },
  {
    id: 3,
    name: 'Mike Ross',
    role: 'Senior Barber',
    specialties: ['Haircut', 'Beard Trim', 'Shaving'],
    experience: '2 years',
    avatar: MikeRoss,
    schedule: {
      monday: { start: '11:00', end: '19:00' },
      tuesday: { start: '11:00', end: '19:00' },
      wednesday: { start: '11:00', end: '19:00' },
      thursday: { start: '11:00', end: '19:00' },
      friday: { start: '11:00', end: '19:00' },
      saturday: { start: '10:00', end: '18:00' },
      sunday: null,
    },
  },
  {
    id: 4,
    name: 'Osman Ahmed',
    role: 'Makeup Artist',
    specialties: ['Facial', 'Makeup', 'Eyebrow Shaping'],
    experience: '4 years',
    avatar: OsmanAhmed,
    schedule: {
      monday: { start: '09:00', end: '14:00' },
      tuesday: { start: '09:00', end: '14:00' },
      wednesday: { start: '09:00', end: '14:00' },
      thursday: { start: '09:00', end: '14:00' },
      friday: { start: '09:00', end: '14:00' },
      saturday: null,
      sunday: null,
    },
  },
]

export function getArtisanById(id) {
  const numericId = Number(id)
  return artisans.find((member) => member.id === numericId) ?? null
}
