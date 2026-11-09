import { useCallback, useState } from 'react';
import { Calendar, Filter, RefreshCw, Search } from 'lucide-react';
import { formatAppointmentDisplay } from '../../../shared/lib';
import { useServices } from '../../services/hooks';
import { formatServicePrice } from '../../services/lib/formatServicePrice';
import { useAppointments } from '../hooks';
import type { Appointment, AppointmentStatus } from '../api';
import { AdminAppointmentMenu } from './AdminAppointmentMenu';
import { AdminRescheduleModal } from './AdminRescheduleModal';
import { AdminViewAppointmentModal } from './AdminViewAppointmentModal';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

const STATUS_OPTIONS: { value: '' | AppointmentStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export function AdminAppointmentsPage() {
  const { services } = useServices();
  const [status, setStatus] = useState<'' | AppointmentStatus>('');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Appointment | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  const { appointments, meta, loading, error, refetch } = useAppointments({
    status,
    service_id: serviceId,
    from,
    to,
    page,
  });

  const resetPage = useCallback((updater: () => void) => {
    updater();
    setPage(1);
  }, []);

  const clearFilters = () => {
    setStatus('');
    setServiceId('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const hasFilters = Boolean(status || serviceId || from || to);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Appointments <span className="text-champagne">Manager</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            All bookings from the API (paginated, filters: status / service /
            date)
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-champagne border border-champagne/40 rounded-lg hover:bg-champagne hover:text-black transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-obsidian-surface/40 border border-white/5 rounded-xl p-3 sm:p-4">
        <div>
          <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">
            Status
          </label>
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-champagne-muted"
            />
            <select
              value={status}
              onChange={(e) =>
                resetPage(() =>
                  setStatus(e.target.value as '' | AppointmentStatus),
                )
              }
              className="w-full bg-obsidian border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-champagne focus:outline-none appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">
            Service
          </label>
          <select
            value={serviceId === '' ? '' : String(serviceId)}
            onChange={(e) =>
              resetPage(() =>
                setServiceId(e.target.value ? Number(e.target.value) : ''),
              )
            }
            className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => resetPage(() => setFrom(e.target.value))}
            className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#777] uppercase tracking-wider mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => resetPage(() => setTo(e.target.value))}
            className="w-full bg-obsidian border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-champagne focus:outline-none"
          />
        </div>

        {hasFilters && (
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-wide text-champagne hover:text-white cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading && (
          <p className="text-champagne-muted text-sm py-16 text-center">
            Loading appointments…
          </p>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="px-4 py-2 text-xs uppercase tracking-wider text-champagne border border-champagne/40 rounded-lg cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-obsidian-elevated p-4 rounded-full mb-4">
              {hasFilters ? (
                <Search size={40} className="text-[#333]" />
              ) : (
                <Calendar size={48} className="text-[#333]" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No appointments found
            </h3>
            <p className="text-champagne-muted max-w-md text-sm">
              {hasFilters
                ? 'Try adjusting your filters.'
                : 'There are no appointments in the system yet.'}
            </p>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-obsidian-surface text-[#777] uppercase text-[11px] font-bold tracking-wider border-b border-[#333]">
                  <tr>
                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Service</th>
                    <th className="px-6 py-5">Starts / Ends</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.map((appointment) => {
                    const name =
                      appointment.user?.name ?? `User #${appointment.user_id}`;
                    const email = appointment.user?.email ?? '';
                    const serviceName =
                      appointment.service?.name ??
                      `Service #${appointment.service_id}`;
                    const price = appointment.service
                      ? formatServicePrice(appointment.service.price)
                      : '—';

                    return (
                      <tr
                        key={appointment.id}
                        className="hover:bg-white/2 transition-colors"
                      >
                        <td className="px-6 py-4 text-[#555] font-mono text-xs">
                          #{appointment.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">
                            {name}
                          </div>
                          <div className="text-[#777] text-xs mt-0.5">
                            {email || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-300 text-sm font-medium">
                            {serviceName}
                          </div>
                          <div className="text-champagne text-xs font-bold mt-1">
                            {price}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium">
                            {formatAppointmentDisplay(appointment.starts_at)}{' '}
                            UTC
                          </div>
                          <div className="text-[#777] text-xs mt-1">
                            → {formatAppointmentDisplay(appointment.ends_at)}{' '}
                            UTC
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <AppointmentStatusBadge
                            status={appointment.status}
                          />
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <AdminAppointmentMenu
                            appointment={appointment}
                            onView={setViewing}
                            onReschedule={setRescheduling}
                            onChanged={() => void refetch()}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden p-3 sm:p-4 space-y-3">
              {appointments.map((appointment) => {
                const name =
                  appointment.user?.name ?? `User #${appointment.user_id}`;
                const serviceName =
                  appointment.service?.name ??
                  `Service #${appointment.service_id}`;

                return (
                  <div
                    key={appointment.id}
                    className="bg-obsidian-elevated p-3 sm:p-4 rounded-xl border border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-white text-sm truncate">
                            {name}
                          </h4>
                          <span className="text-[#555] font-mono text-[10px]">
                            #{appointment.id}
                          </span>
                        </div>
                        <p className="text-[#777] text-xs truncate mt-0.5">
                          {serviceName}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                      <div className="text-xs text-gray-400">
                        {formatAppointmentDisplay(appointment.starts_at)} UTC
                      </div>
                      <AdminAppointmentMenu
                        appointment={appointment}
                        onView={setViewing}
                        onReschedule={setRescheduling}
                        onChanged={() => void refetch()}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-obsidian-surface px-3 sm:px-6 py-3 sm:py-4 border-t border-[#333] flex justify-between items-center text-[10px] sm:text-xs text-champagne-muted">
              <span>
                Page{' '}
                <span className="text-champagne font-bold">
                  {meta?.current_page ?? page}
                </span>{' '}
                of{' '}
                <span className="text-white font-bold">
                  {meta?.last_page ?? 1}
                </span>
                {meta ? (
                  <>
                    {' '}
                    · <span className="text-white font-bold">{meta.total}</span>{' '}
                    total
                  </>
                ) : null}
              </span>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={!meta || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 sm:px-3 py-1 bg-obsidian-surface border border-[#333] rounded hover:border-champagne hover:text-champagne transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!meta || page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 sm:px-3 py-1 bg-obsidian-surface border border-[#333] rounded hover:border-champagne hover:text-champagne transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {viewing && (
        <AdminViewAppointmentModal
          appointment={viewing}
          onClose={() => setViewing(null)}
        />
      )}
      {rescheduling && (
        <AdminRescheduleModal
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onSuccess={() => void refetch()}
        />
      )}
    </div>
  );
}
