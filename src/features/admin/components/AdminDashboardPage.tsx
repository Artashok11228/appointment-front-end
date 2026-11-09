import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  RefreshCw,
  Scissors,
  XCircle,
  Percent,
} from 'lucide-react';
import StatsCard from '../../../Components/AdminPanel Components/StatsCard';
import { useAdminStats } from '../hooks';

function BookingsPerDayChart({
  days,
}: {
  days: { date: string; total: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-0.5 sm:gap-1 h-36 sm:h-44 overflow-x-auto pb-1">
        {days.map((day) => {
          const heightPct = Math.max(4, (day.total / max) * 100);
          return (
            <div
              key={day.date}
              className="flex-1 min-w-[6px] sm:min-w-[8px] flex flex-col items-center justify-end h-full group"
              title={`${day.date}: ${day.total}`}
            >
              <span className="text-[9px] text-champagne opacity-0 group-hover:opacity-100 mb-1 font-bold">
                {day.total}
              </span>
              <div
                className="w-full rounded-t bg-champagne/70 hover:bg-champagne transition-colors"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-[#666] font-mono">
        <span>{days[0]?.date ?? '—'}</span>
        <span>Last 30 days (created)</span>
        <span>{days[days.length - 1]?.date ?? '—'}</span>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { stats, loading, error, refetch } = useAdminStats();

  const byStatus = stats?.by_status;
  const totalAppointments = byStatus
    ? byStatus.confirmed + byStatus.cancelled + byStatus.completed
    : 0;
  const cancelPct = stats
    ? `${(stats.cancellation_rate * 100).toFixed(1)}%`
    : '—';

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Admin <span className="text-champagne">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Live metrics from GET /admin/stats
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-champagne border border-champagne/40 rounded-lg hover:bg-champagne hover:text-black transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white border border-[#333] rounded-lg hover:border-champagne hover:text-champagne transition-colors"
          >
            Appointments
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-champagne-muted text-sm py-12 text-center">
          Loading stats…
        </p>
      )}

      {error && !loading && (
        <div className="bg-obsidian-surface border border-red-900/40 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-400 text-sm" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-xs uppercase tracking-wider text-champagne border border-champagne/40 px-4 py-2 rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <StatsCard
              title="Total Appointments"
              value={String(totalAppointments)}
              change={`${byStatus?.confirmed ?? 0} confirmed`}
              positive
              icon={<Calendar size={24} />}
              color="text-champagne"
              bg="bg-champagne/10"
            />
            <StatsCard
              title="Confirmed"
              value={String(byStatus?.confirmed ?? 0)}
              change="by status"
              positive
              icon={<CheckCircle2 size={24} />}
              color="text-emerald-500"
              bg="bg-emerald-500/10"
            />
            <StatsCard
              title="Cancelled"
              value={String(byStatus?.cancelled ?? 0)}
              change={`${byStatus?.completed ?? 0} completed`}
              positive={false}
              icon={<XCircle size={24} />}
              color="text-rose-500"
              bg="bg-rose-500/10"
            />
            <StatsCard
              title="Cancellation Rate"
              value={cancelPct}
              change="cancelled / total"
              positive={stats.cancellation_rate < 0.3}
              icon={<Percent size={24} />}
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-obsidian-surface px-4 sm:px-6 py-4 sm:py-5 border-b border-[#333]">
                <h2 className="text-lg sm:text-xl font-extrabold text-champagne">
                  <span className="text-white">Bookings</span> per day
                </h2>
                <p className="text-xs text-[#666] mt-1">
                  Appointments created in the last 30 days
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {stats.bookings_per_day.length === 0 ? (
                  <p className="text-sm text-[#777] text-center py-8">
                    No daily data
                  </p>
                ) : (
                  <BookingsPerDayChart days={stats.bookings_per_day} />
                )}
              </div>
            </div>

            <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-obsidian-surface px-4 sm:px-6 py-4 sm:py-5 border-b border-[#333] flex items-center gap-2">
                <Scissors size={18} className="text-champagne" />
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-champagne">
                    <span className="text-white">Top</span> services
                  </h2>
                  <p className="text-xs text-[#666] mt-0.5">Up to 5 services</p>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {stats.top_services.length === 0 ? (
                  <p className="text-sm text-[#777] text-center py-8">
                    No service bookings yet
                  </p>
                ) : (
                  stats.top_services.map((service, index) => {
                    const maxTotal = stats.top_services[0]?.total || 1;
                    const widthPct = Math.max(
                      8,
                      (service.total / maxTotal) * 100,
                    );
                    return (
                      <div key={service.service_id} className="space-y-1.5">
                        <div className="flex justify-between text-sm gap-2">
                          <span className="text-white font-medium truncate">
                            <span className="text-[#555] mr-2">
                              #{index + 1}
                            </span>
                            {service.name}
                          </span>
                          <span className="text-champagne font-bold shrink-0">
                            {service.total}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-obsidian overflow-hidden border border-[#222]">
                          <div
                            className="h-full bg-champagne/80 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
