import { useState } from 'react';
import { Plus, Pencil, Trash2, Scissors, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../../Components/ConfirmModal';
import { useMessage } from '../../../Context/MessageContext';
import { handleApiFailure } from '../../../shared/api';
import type { Service, ServiceWrite } from '../api';
import { formatServicePrice } from '../lib/formatServicePrice';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '../hooks';
import { ServiceFormModal } from './ServiceFormModal';

type FormState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; service: Service };

export function AdminServicesPage() {
  const { services, loading, error, refetch } = useServices();
  const { create, submitting: creating } = useCreateService();
  const { update, submitting: updating } = useUpdateService();
  const { remove, submitting: deleting } = useDeleteService();
  const { showMessage } = useMessage();

  const [form, setForm] = useState<FormState>({ open: false });
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const submitting = creating || updating;

  const closeForm = () => {
    setForm({ open: false });
    setServerError(null);
    setFieldErrors(null);
  };

  const handleFormSubmit = async (body: ServiceWrite) => {
    setServerError(null);
    setFieldErrors(null);

    if (form.open && form.mode === 'edit') {
      const result = await update(form.service.id, body);
      if (!result.ok) {
        handleApiFailure(result, {
          showMessage,
          onFieldErrors: (errors) => setFieldErrors(errors),
        });
        setServerError(
          result.status === 403
            ? result.message || 'You are not allowed to update services.'
            : result.message,
        );
        return;
      }
      showMessage('success', `Updated “${result.service.name}”.`);
      closeForm();
      void refetch();
      return;
    }

    const result = await create(body);
    if (!result.ok) {
      handleApiFailure(result, {
        showMessage,
        onFieldErrors: (errors) => setFieldErrors(errors),
      });
      setServerError(
        result.status === 403
          ? result.message || 'You are not allowed to create services.'
          : result.message,
      );
      return;
    }
    showMessage('success', `Created “${result.service.name}”.`);
    closeForm();
    void refetch();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);

    const result = await remove(target.id);
    if (!result.ok) {
      handleApiFailure(result, { showMessage });
      return;
    }

    showMessage('success', `Deleted “${target.name}”.`);
    void refetch();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Services <span className="text-champagne">Catalog</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Manage bookable services (name, duration, price)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={loading}
            className="flex items-center gap-1.5 cursor-pointer border border-white/10 hover:border-champagne/40 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setServerError(null);
              setFieldErrors(null);
              setForm({ open: true, mode: 'create' });
            }}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-champagne hover:bg-champagne-dark text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-champagne/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      <div className="bg-obsidian-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            Loading services…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-bold text-champagne hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-obsidian-elevated p-4 rounded-full mb-4 ring-1 ring-white/5">
              <Scissors size={48} className="text-[#333]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No services yet</h3>
            <p className="text-champagne-muted max-w-sm mx-auto text-sm">
              Create the first service so customers can book it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-obsidian-elevated/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-bold">Name</th>
                  <th className="px-4 sm:px-6 py-3 font-bold">Duration</th>
                  <th className="px-4 sm:px-6 py-3 font-bold">Price</th>
                  <th className="px-4 sm:px-6 py-3 font-bold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3.5 text-white font-medium">
                      {service.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-gray-300">
                      {service.duration_minutes} min
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-champagne font-semibold">
                      {formatServicePrice(service.price)}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setServerError(null);
                            setFieldErrors(null);
                            setForm({
                              open: true,
                              mode: 'edit',
                              service,
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-champagne hover:bg-champagne/10 rounded-lg cursor-pointer transition-colors"
                          title="Edit"
                          aria-label={`Edit ${service.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(service)}
                          disabled={deleting}
                          className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          title="Delete"
                          aria-label={`Delete ${service.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form.open ? (
        <ServiceFormModal
          mode={form.mode}
          service={form.mode === 'edit' ? form.service : null}
          submitting={submitting}
          serverError={serverError}
          fieldErrors={fieldErrors}
          onClose={closeForm}
          onSubmit={(body) => {
            void handleFormSubmit(body);
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmModal
          message={`Delete “${pendingDelete.name}”? This fails if the service has any appointment history.`}
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}
