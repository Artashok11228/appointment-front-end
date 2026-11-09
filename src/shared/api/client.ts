import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './generated/schema';
import { toApiError } from './errors';

export const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
}

export function setAuthToken(
  token: string,
  persist: 'local' | 'session' = 'local',
): void {
  clearAuthToken();
  const storage = persist === 'session' ? sessionStorage : localStorage;
  storage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Register a global 401 handler (AuthProvider). Pass null to clear. */
export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

function resolveBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
  return raw.replace(/\/$/, '');
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set('Accept', 'application/json');

    if (
      request.method !== 'GET' &&
      request.method !== 'HEAD' &&
      !request.headers.has('Content-Type') &&
      request.body
    ) {
      request.headers.set('Content-Type', 'application/json');
    }

    const token = getAuthToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  },
};

const unauthorizedMiddleware: Middleware = {
  async onResponse({ response, request }) {
    if (response.status === 401) {
      clearAuthToken();
      // Logout may return 401 for an already-revoked token; AuthProvider clears locally.
      const path = new URL(request.url).pathname;
      if (!path.endsWith('/logout')) {
        unauthorizedHandler?.();
      }
    }
    return response;
  },
};

/** Typed OpenAPI client. Prefer this over hand-written fetch. */
export const apiClient = createClient<paths>({
  baseUrl: resolveBaseUrl(),
});

apiClient.use(authMiddleware);
apiClient.use(unauthorizedMiddleware);

type ErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Throw ApiError when openapi-fetch returns an error payload or non-OK response.
 * Use in feature api wrappers after each call.
 */
export async function unwrapApiResult<T>(result: {
  data?: T;
  error?: ErrorPayload;
  response: Response;
}): Promise<T> {
  if (result.response.ok && result.data !== undefined) {
    return result.data;
  }

  // 204 No Content
  if (result.response.ok && result.response.status === 204) {
    return undefined as T;
  }

  throw toApiError(result.response.status, result.error ?? null);
}
