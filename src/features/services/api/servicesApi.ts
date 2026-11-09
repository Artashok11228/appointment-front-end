import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type Service = components['schemas']['Service'];
export type ServiceWrite = components['schemas']['ServiceWrite'];

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

export async function createService(body: ServiceWrite): Promise<Service> {
  const payload = await unwrapApiResult(
    await apiClient.POST('/services', { body }),
  );
  return payload.data;
}

/** PATCH still requires all ServiceWrite fields — treat as full replace. */
export async function updateService(
  serviceId: number,
  body: ServiceWrite,
): Promise<Service> {
  const payload = await unwrapApiResult(
    await apiClient.PATCH('/services/{service}', {
      params: { path: { service: serviceId } },
      body,
    }),
  );
  return payload.data;
}

export async function deleteService(serviceId: number): Promise<void> {
  await unwrapApiResult(
    await apiClient.DELETE('/services/{service}', {
      params: { path: { service: serviceId } },
    }),
  );
}
