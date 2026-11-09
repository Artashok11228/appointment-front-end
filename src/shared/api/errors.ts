export type ApiErrorBody = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

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

/** Map JSON error payloads (401/403/404/409/422/429) into ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  if (isRecord(body)) {
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message
        : `Request failed with status ${status}`;

    const errors =
      isRecord(body.errors) &&
      Object.values(body.errors).every(
        (v) => Array.isArray(v) && v.every((item) => typeof item === 'string'),
      )
        ? (body.errors as Record<string, string[]>)
        : undefined;

    return new ApiError({ status, message, errors });
  }

  return new ApiError({
    status,
    message: `Request failed with status ${status}`,
  });
}
