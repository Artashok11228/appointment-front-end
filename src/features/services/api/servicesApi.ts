import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type Service = components['schemas']['Service'];

export async function listServices(): Promise<Service[]> {
  const payload = await unwrapApiResult(await apiClient.GET('/services'));
  return payload.data;
}

export async function getService(serviceId: number): Promise<Service> {
  const payload = await unwrapApiResult(
    await apiClient.GET('/services/{service}', {
      params: { path: { service: serviceId } },
    }),
  );
  return payload.data;
}
