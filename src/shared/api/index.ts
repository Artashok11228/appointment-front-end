/** Shared API surface — smoke-import generated types + HTTP client. */
export type { paths, components, operations } from './generated/schema';
export {
  apiClient,
  unwrapApiResult,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  setUnauthorizedHandler,
  AUTH_TOKEN_KEY,
} from './client';
export {
  ApiError,
  toApiError,
  toApiFailure,
  toApiErrorMessage,
  FORBIDDEN_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from './errors';
export type { ApiErrorBody, ApiFailure } from './errors';
