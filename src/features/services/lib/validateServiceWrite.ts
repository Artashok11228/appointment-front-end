import type { ServiceWrite } from '../api';

export type ServiceFormValues = {
  name: string;
  duration_minutes: string;
  price: string;
};

export type ServiceFormErrors = Partial<
  Record<keyof ServiceFormValues, string>
>;

/** Client-side checks aligned with OpenAPI ServiceWrite. */
export function validateServiceWrite(
  values: ServiceFormValues,
): { ok: true; body: ServiceWrite } | { ok: false; errors: ServiceFormErrors } {
  const errors: ServiceFormErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length > 255) {
    errors.name = 'Name must be at most 255 characters.';
  }

  const durationRaw = values.duration_minutes.trim();
  const duration = Number(durationRaw);
  if (!durationRaw) {
    errors.duration_minutes = 'Duration is required.';
  } else if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
    errors.duration_minutes = 'Duration must be an integer from 1 to 1440.';
  }

  const priceRaw = values.price.trim();
  const price = Number(priceRaw);
  if (!priceRaw) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
    errors.price = 'Price must be a number from 0 to 99999999.99.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    body: {
      name,
      duration_minutes: duration,
      price,
    },
  };
}

export function serviceToFormValues(service: {
  name: string;
  duration_minutes: number;
  price: string;
}): ServiceFormValues {
  return {
    name: service.name,
    duration_minutes: String(service.duration_minutes),
    price: service.price,
  };
}
