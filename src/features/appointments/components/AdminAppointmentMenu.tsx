import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, MoreVertical, XCircle } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';
import { useMessage } from '../../../Context/MessageContext';
import { useCancelAppointment } from '../hooks';
import {
  adminModificationBlockReason,
  canAdminModifyAppointment,
} from '../lib/canModifyAppointment';
import type { Appointment } from '../api';

type Props = {
  appointment: Appointment;
  onView: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onChanged: () => void;
};

export function AdminAppointmentMenu({
  appointment,
  onView,
  onReschedule,
  onChanged,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { showMessage } = useMessage();
  const { cancel, submitting } = useCancelAppointment();

  const canModify = canAdminModifyAppointment(appointment);
  const blockReason = adminModificationBlockReason(appointment);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 192,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleCancel = async () => {
    const result = await cancel(appointment.id);
    setConfirmCancel(false);
    setIsOpen(false);
    if (result.ok) {
      showMessage('success', 'Appointment cancelled.');
      onChanged();
      return;
    }
    showMessage('error', result.message);
  };

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        className={`text-[#555] hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg cursor-pointer ${isOpen ? 'text-white bg-white/10' : ''}`}
        onClick={toggleMenu}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              position: 'fixed',
              zIndex: 9999,
            }}
            className="w-48 bg-obsidian-surface border border-[#333] rounded-lg shadow-xl py-1"
          >
            <button
              type="button"
              onClick={() => {
                onView(appointment);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-[#cbd5e1] hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye size={14} className="text-blue-400" />
              View Details
            </button>

            <button
              type="button"
              disabled={!canModify || submitting}
              title={blockReason || undefined}
              onClick={() => {
                onReschedule(appointment);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-[#cbd5e1] hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors border-b border-[#333]/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Edit size={14} className="text-champagne" />
              Reschedule
            </button>

            {canModify && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setConfirmCancel(true);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
              >
                <XCircle size={14} />
                Cancel
              </button>
            )}
          </div>,
          document.body,
        )}

      {confirmCancel && (
        <ConfirmModal
          message="Cancel this appointment? This sets status to cancelled."
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </div>
  );
}
