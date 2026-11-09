/** Shared UX policy for API status codes (OpenAPI clientHelpers). */

export type ApiFailureLike = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type MessageToaster = (
  type: 'success' | 'error' | 'warning',
  text: string,
) => void;

export type HandleApiFailureOptions = {
  showMessage: MessageToaster;
  /** Bind Laravel `errors` map to form fields (422). */
  onFieldErrors?: (errors: Record<string, string[]>) => void;
  /** Also toast the 422 summary when field errors were bound (default false). */
  toastValidationSummary?: boolean;
};

export type HandleApiFailureResult = {
  rateLimited: boolean;
  fieldBound: boolean;
};

const FALLBACK_403 = 'You are not allowed to do that.';
const FALLBACK_404 = 'Not found.';
const FALLBACK_429 = 'Too many requests. Try again later.';

/**
 * Central status → UX mapping:
 * 401 logout (middleware); 403/404 toast; 409 message toast;
 * 422 field bind; 429 “try later”.
 */
export function handleApiFailure(
  failure: ApiFailureLike,
  options: HandleApiFailureOptions,
): HandleApiFailureResult {
  const status = failure.status;
  const message =
    typeof failure.message === 'string' && failure.message.trim()
      ? failure.message.trim()
      : 'Request failed';

  if (status === 401) {
    // unauthorizedMiddleware + AuthProvider already clear token / redirect.
    return { rateLimited: false, fieldBound: false };
  }

  if (status === 429) {
    options.showMessage('warning', message || FALLBACK_429);
    return { rateLimited: true, fieldBound: false };
  }

  if (status === 422) {
    if (failure.errors && options.onFieldErrors) {
      options.onFieldErrors(failure.errors);
      if (options.toastValidationSummary) {
        options.showMessage('error', message);
      }
      return { rateLimited: false, fieldBound: true };
    }
    options.showMessage('error', message);
    return { rateLimited: false, fieldBound: false };
  }

  if (status === 409) {
    options.showMessage('error', message);
    return { rateLimited: false, fieldBound: false };
  }

  if (status === 403) {
    options.showMessage('error', message || FALLBACK_403);
    return { rateLimited: false, fieldBound: false };
  }

  if (status === 404) {
    options.showMessage('error', message || FALLBACK_404);
    return { rateLimited: false, fieldBound: false };
  }

  options.showMessage('error', message);
  return { rateLimited: false, fieldBound: false };
}

/** Brief login submit lock after HTTP 429 (ms). */
export const LOGIN_RATE_LIMIT_COOLDOWN_MS = 15_000;
