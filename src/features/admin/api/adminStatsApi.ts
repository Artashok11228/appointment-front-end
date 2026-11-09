import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type AdminStats = components['schemas']['AdminStats'];

export async function getAdminStats(): Promise<AdminStats> {
  const payload = await unwrapApiResult(
    await apiClient.GET('/admin/stats'),
  );
  return payload.data;
}
