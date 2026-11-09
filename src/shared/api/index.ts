/** Shared API surface — smoke-import generated types + HTTP client. */
export type { paths, components, operations } from './generated/schema';
export {
  apiClient,
  unwrapApiResult,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  AUTH_TOKEN_KEY,
} from './client';
export { ApiError, toApiError } from './errors';
export type { ApiErrorBody } from './errors';
