export type ApiErrorBody = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

/** Fixed copy for forbidden responses. */
export const FORBIDDEN_MESSAGE = 'You are not allowed to do that.';

/** Fixed copy for rate-limit responses (login 5/min, general 60/min). */
export const RATE_LIMIT_MESSAGE = 'Please try later.';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor({ status, message, errors }: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Please sign in again.';
    case 403:
      return FORBIDDEN_MESSAGE;
    case 404:
      return 'Not found.';
    case 409:
      return 'This action conflicts with the current state.';
    case 422:
      return 'Please check the form and try again.';
    case 429:
      return RATE_LIMIT_MESSAGE;
    default:
      return `Request failed with status ${status}`;
  }
}

/** Map JSON error payloads (401/403/404/409/422/429) into ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  // Keep 403/429 copy fixed so UI toasts stay consistent across features.
  if (status === 403) {
    return new ApiError({ status, message: FORBIDDEN_MESSAGE });
  }
  if (status === 429) {
    return new ApiError({ status, message: RATE_LIMIT_MESSAGE });
  }

  if (isRecord(body)) {
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message
        : defaultMessageForStatus(status);

    const errors =
      isRecord(body.errors) &&
      Object.values(body.errors).every(
        (v) => Array.isArray(v) && v.every((item) => typeof item === 'string'),
      )
        ? (body.errors as Record<string, string[]>)
        : undefined;

    return new ApiError({
      status,
      message,
      errors: status === 422 ? errors : undefined,
    });
  }

  return new ApiError({
    status,
    message: defaultMessageForStatus(status),
  });
}

/** Normalized failure for hooks / forms (status map from the API contract). */
export type ApiFailure = {
  message: string;
  status?: number;
  /** Present for 422 validation — bind to form fields. */
  errors?: Record<string, string[]>;
  /** 422 → bind fields in the form. */
  bindFields: boolean;
  /**
   * Whether UI should toast this failure.
   * 401 is handled by the client unauthorized handler (logout/redirect).
   */
  shouldToast: boolean;
};

/**
 * Central status → UX mapping:
 * 401 logout (elsewhere); 403/404/409 toast; 422 field bind; 429 fixed “try later”.
 */
export function toApiFailure(err: unknown, fallback: string): ApiFailure {
  if (err instanceof ApiError) {
    const message =
      err.status === 403
        ? FORBIDDEN_MESSAGE
        : err.status === 429
          ? RATE_LIMIT_MESSAGE
          : err.message.trim() || defaultMessageForStatus(err.status);

    return {
      message,
      status: err.status,
      errors: err.status === 422 ? err.errors : undefined,
      bindFields: err.status === 422,
      shouldToast: err.status !== 401,
    };
  }

  if (err instanceof Error && err.message.trim()) {
    return {
      message: err.message,
      bindFields: false,
      shouldToast: true,
    };
  }

  return {
    message: fallback,
    bindFields: false,
    shouldToast: true,
  };
}

/** Short message for query-hook `error` state. */
export function toApiErrorMessage(err: unknown, fallback: string): string {
  return toApiFailure(err, fallback).message;
}
