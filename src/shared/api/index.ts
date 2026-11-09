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
export { ApiError, toApiError } from './errors';
export type { ApiErrorBody } from './errors';
export {
  handleApiFailure,
  LOGIN_RATE_LIMIT_COOLDOWN_MS,
} from './handleApiFailure';
export type {
  ApiFailureLike,
  HandleApiFailureOptions,
  HandleApiFailureResult,
  MessageToaster,
} from './handleApiFailure';
