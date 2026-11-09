import { useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, Mail } from 'lucide-react';
import { formatAppointmentDisplay } from '../../../shared/lib';
import { formatServicePrice } from '../../services/lib/formatServicePrice';
import type { Appointment } from '../api';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

type Props = {
  appointment: Appointment;
  onClose: () => void;
};

export function AdminViewAppointmentModal({ appointment, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const clientName = appointment.user?.name ?? `User #${appointment.user_id}`;
  const clientEmail = appointment.user?.email ?? '—';
  const serviceName =
    appointment.service?.name ?? `Service #${appointment.service_id}`;
  const priceLabel = appointment.service
    ? formatServicePrice(appointment.service.price)
    : '—';
  const duration = appointment.service?.duration_minutes;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-obsidian-surface border border-[#333] w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#333] shrink-0">
          <h2 className="text-base sm:text-xl font-bold text-white">
            Appointment Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-xl font-black text-white">
                {serviceName}
              </h3>
              <p className="text-champagne font-bold text-base sm:text-lg">
                {priceLabel}
              </p>
            </div>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-champagne-muted uppercase flex items-center gap-1.5">
                <Calendar size={12} /> Starts
              </label>
              <p className="text-white font-medium">
                {formatAppointmentDisplay(appointment.starts_at)} UTC
              </p>
              <p className="text-[11px] text-[#666] font-mono break-all">
                {appointment.starts_at}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-champagne-muted uppercase flex items-center gap-1.5">
                <Clock size={12} /> Ends
              </label>
              <p className="text-white font-medium">
                {formatAppointmentDisplay(appointment.ends_at)} UTC
              </p>
              <p className="text-[11px] text-[#666] font-mono break-all">
                {appointment.ends_at}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-champagne-muted uppercase flex items-center gap-1.5">
                <User size={12} /> Customer
              </label>
              <p className="text-white font-medium">{clientName}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-champagne-muted uppercase flex items-center gap-1.5">
                <Scissors size={12} /> Service
              </label>
              <p className="text-white font-medium">
                {serviceName}
                {duration != null ? ` · ${duration} min` : ''}
              </p>
            </div>
          </div>

          <div className="bg-obsidian-elevated p-3 sm:p-4 rounded-xl border border-[#333] space-y-2">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Mail size={16} className="text-champagne-muted shrink-0" />
              <span className="text-gray-300 break-all">{clientEmail}</span>
            </div>
            <p className="text-[11px] text-[#666]">
              Appointment #{appointment.id} · user_id {appointment.user_id} ·
              service_id {appointment.service_id}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-[#333] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-obsidian-elevated hover:bg-[#222] text-white border border-[#333] rounded-lg text-sm font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
