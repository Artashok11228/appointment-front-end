import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import type { Service } from '../api';
import {
  serviceToFormValues,
  validateServiceWrite,
  type ServiceFormErrors,
  type ServiceFormValues,
} from '../lib/validateServiceWrite';

type Props = {
  mode: 'create' | 'edit';
  service?: Service | null;
  submitting: boolean;
  serverError?: string | null;
  fieldErrors?: Record<string, string[]> | null;
  onClose: () => void;
  onSubmit: (body: {
    name: string;
    duration_minutes: number;
    price: number;
  }) => void;
};

const EMPTY: ServiceFormValues = {
  name: '',
  duration_minutes: '',
  price: '',
};

export function ServiceFormModal({
  mode,
  service,
  submitting,
  serverError,
  fieldErrors,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ServiceFormValues>(EMPTY);
  const [errors, setErrors] = useState<ServiceFormErrors>({});

  useEffect(() => {
    setValues(service ? serviceToFormValues(service) : EMPTY);
    setErrors({});
  }, [service, mode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateServiceWrite(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.body);
  };

  const fieldError = (key: keyof ServiceFormValues) =>
    errors[key] ?? fieldErrors?.[key]?.[0] ?? null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-obsidian-elevated border border-[#333] rounded-xl shadow-2xl w-full max-w-md"
        role="dialog"
        aria-labelledby="service-form-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2
            id="service-form-title"
            className="text-lg font-bold text-white"
          >
            {mode === 'create' ? 'Add Service' : 'Edit Service'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {serverError ? (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {serverError}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="service-name"
              className="block text-xs font-bold text-champagne uppercase tracking-wider mb-1.5"
            >
              Name
            </label>
            <input
              id="service-name"
              name="name"
              type="text"
              maxLength={255}
              value={values.name}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-obsidian border border-[#27272a] text-white text-sm rounded-lg focus:ring-1 focus:ring-champagne focus:border-champagne p-2.5 outline-none"
            />
            {fieldError('name') ? (
              <p className="mt-1 text-xs text-rose-400">{fieldError('name')}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="service-duration"
              className="block text-xs font-bold text-champagne uppercase tracking-wider mb-1.5"
            >
              Duration (minutes)
            </label>
            <input
              id="service-duration"
              name="duration_minutes"
              type="number"
              min={1}
              max={1440}
              step={1}
              value={values.duration_minutes}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-obsidian border border-[#27272a] text-white text-sm rounded-lg focus:ring-1 focus:ring-champagne focus:border-champagne p-2.5 outline-none"
            />
            {fieldError('duration_minutes') ? (
              <p className="mt-1 text-xs text-rose-400">
                {fieldError('duration_minutes')}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="service-price"
              className="block text-xs font-bold text-champagne uppercase tracking-wider mb-1.5"
            >
              Price
            </label>
            <input
              id="service-price"
              name="price"
              type="number"
              min={0}
              max={99999999.99}
              step="0.01"
              value={values.price}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-obsidian border border-[#27272a] text-white text-sm rounded-lg focus:ring-1 focus:ring-champagne focus:border-champagne p-2.5 outline-none"
            />
            {fieldError('price') ? (
              <p className="mt-1 text-xs text-rose-400">
                {fieldError('price')}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white border border-[#333] hover:border-gray-500 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-champagne hover:bg-champagne-dark rounded-lg disabled:opacity-60 cursor-pointer"
            >
              <Save size={16} />
              {submitting
                ? 'Saving…'
                : mode === 'create'
                  ? 'Create'
                  : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
