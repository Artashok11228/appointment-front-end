import type { ReactNode } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '../api';

const STYLES: Record<AppointmentStatus, string> = {
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
};

const ICONS: Record<AppointmentStatus, ReactNode> = {
  confirmed: <CheckCircle2 size={12} />,
  cancelled: <XCircle size={12} />,
  completed: <CheckCircle2 size={12} />,
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border capitalize ${STYLES[status] ?? 'bg-amber-500/10 text-amber-400 border-amber-500/10'}`}
    >
      {ICONS[status] ?? <Clock size={12} />}
      {status}
    </span>
  );
}
