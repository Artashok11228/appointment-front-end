import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type User = components['schemas']['User'];
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type AuthTokenResponse = components['schemas']['AuthTokenResponse'];

export async function register(
  body: RegisterRequest,
): Promise<AuthTokenResponse> {
  return unwrapApiResult(
    await apiClient.POST('/register', { body }),
  );
}

export async function login(body: LoginRequest): Promise<AuthTokenResponse> {
  return unwrapApiResult(await apiClient.POST('/login', { body }));
}

export async function logout(): Promise<void> {
  await unwrapApiResult(await apiClient.POST('/logout'));
}

export async function me(): Promise<User> {
  const payload = await unwrapApiResult(await apiClient.GET('/me'));
  return payload.data;
}
